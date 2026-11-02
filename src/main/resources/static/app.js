const API_BASE = ""; // Same Spring Boot server

const setupScreen = document.getElementById("setupScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const quizForm = document.getElementById("quizForm");
const startButton = document.getElementById("startButton");
const categoryInput = document.getElementById("category");
const countInput = document.getElementById("questionCount");
const titleInput = document.getElementById("quizTitle");

const activeTitle = document.getElementById("activeTitle");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("options");
const nextButton = document.getElementById("nextButton");
const selectionHint = document.getElementById("selectionHint");

const setupMessage = document.getElementById("setupMessage");
const quizMessage = document.getElementById("quizMessage");

let quizId = null;
let questions = [];
let currentIndex = 0;
let answers = [];

function showScreen(screen) {
  setupScreen.classList.toggle("hidden", screen !== "setup");
  quizScreen.classList.toggle("hidden", screen !== "quiz");
  resultScreen.classList.toggle("hidden", screen !== "result");
}

function showError(element, message) {
  element.textContent = message;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" && data) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

quizForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setupMessage.textContent = "";
  startButton.disabled = true;
  startButton.textContent = "Creating quiz…";

  try {
    const category = categoryInput.value.trim();
    const count = Number(countInput.value);
    const title = titleInput.value.trim();

    if (!category || !title) {
      throw new Error("Please enter a category and quiz title.");
    }

    const createdQuiz = await apiRequest(
      `/quiz/create?category=${encodeURIComponent(category)}&numQuestions=${count}&title=${encodeURIComponent(title)}`,
      { method: "POST" }
    );

    // Supports either a quiz object { id: ... } or a numeric ID response.
    quizId = typeof createdQuiz === "number"
      ? createdQuiz
      : Number(createdQuiz?.id);

    if (!Number.isFinite(quizId) || quizId <= 0) {
      throw new Error("Quiz was created, but its ID was not returned. Check the /quiz/create response.");
    }

    const fetchedQuestions = await apiRequest(`/quiz/get/${quizId}`);

    if (!Array.isArray(fetchedQuestions) || fetchedQuestions.length === 0) {
      throw new Error("No questions were returned for this quiz.");
    }

    questions = fetchedQuestions;
    currentIndex = 0;
    answers = new Array(questions.length).fill(null);

    activeTitle.textContent = title;
    showScreen("quiz");
    renderQuestion();
  } catch (error) {
    showError(setupMessage, error.message);
  } finally {
    startButton.disabled = false;
    startButton.innerHTML = 'Start quiz <span>→</span>';
  }
});

function getOptions(question) {
  // Matches the backend QuestionWrapper fields.
  return [
    question.option1,
    question.option2,
    question.option3,
    question.option4
  ];
}

function renderQuestion() {
  const question = questions[currentIndex];
  const options = getOptions(question);

  progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  questionText.textContent = question.questionTitle;
  selectionHint.textContent = answers[currentIndex] === null
    ? "Select one answer"
    : "Answer selected";

  optionsContainer.replaceChildren();
  quizMessage.textContent = "";

  options.forEach((optionText, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.classList.toggle("selected", answers[currentIndex] === optionText);

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + optionIndex);

    const text = document.createElement("span");
    text.textContent = optionText ?? "";

    button.append(letter, text);
    button.addEventListener("click", () => {
      answers[currentIndex] = optionText;
      renderQuestion();
    });

    optionsContainer.appendChild(button);
  });

  nextButton.disabled = answers[currentIndex] === null;
  nextButton.textContent = currentIndex === questions.length - 1
    ? "Submit quiz ✓"
    : "Next question →";
}

nextButton.addEventListener("click", async () => {
  if (answers[currentIndex] === null) return;

  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
    return;
  }

  nextButton.disabled = true;
  nextButton.textContent = "Submitting…";
  quizMessage.textContent = "";

  try {
    // Backend expects: [{ "id": questionId, "response": "selected answer" }, ...]
    const submission = questions.map((question, index) => ({
      id: question.id,
      response: answers[index]
    }));

    const result = await apiRequest(`/quiz/submit/${quizId}`, {
      method: "POST",
      body: JSON.stringify(submission)
    });

    const score = typeof result === "number"
      ? result
      : Number(result?.score ?? result?.result);

    document.getElementById("scoreText").textContent =
      Number.isFinite(score) ? `${score} / ${questions.length}` : "Submitted";

    document.getElementById("resultMessage").textContent =
      Number.isFinite(score)
        ? `You answered ${score} out of ${questions.length} questions correctly.`
        : "Your answers have been submitted successfully.";

    showScreen("result");
  } catch (error) {
    showError(quizMessage, error.message);
    nextButton.disabled = false;
    nextButton.textContent = "Submit quiz ✓";
  }
});

document.getElementById("restartButton").addEventListener("click", () => {
  quizId = null;
  questions = [];
  answers = [];
  currentIndex = 0;
  setupMessage.textContent = "";
  showScreen("setup");
});