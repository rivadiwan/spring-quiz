package com.hittry.quizapp.service;

import com.hittry.quizapp.entity.Question;
import com.hittry.quizapp.entity.Quiz;
import com.hittry.quizapp.model.QuestionWrapper;
import com.hittry.quizapp.model.Response;
import com.hittry.quizapp.repository.QuestionRepository;
import com.hittry.quizapp.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    public QuizService(
            QuestionRepository questionRepository,
            QuizRepository quizRepository
    ) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }

    public Integer createQuiz(String category, int numQuestions, String title) {
        if (numQuestions <= 0) {
            throw new IllegalArgumentException("Number of questions must be greater than zero");
        }

        List<Question> questions =
                questionRepository.findRandomQuestionsByCategory(category, numQuestions);

        if (questions.size() < numQuestions) {
            throw new IllegalArgumentException(
                    "Not enough questions in category: " + category
            );
        }

        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setQuestions(questions);

        return quizRepository.save(quiz).getId();
    }

    public List<QuestionWrapper> getQuizQuestions(Integer quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        return quiz.getQuestions()
                .stream()
                .map(question -> new QuestionWrapper(
                        question.getId(),
                        question.getQuestionTitle(),
                        question.getOption1(),
                        question.getOption2(),
                        question.getOption3(),
                        question.getOption4()
                ))
                .collect(Collectors.toList());
    }

    public Integer calculateResult(Integer quizId, List<Response> responses) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));

        Map<Integer, Response> submittedAnswers = responses.stream()
                .filter(response -> response.getId() != null)
                .collect(Collectors.toMap(
                        Response::getId,
                        Function.identity(),
                        (first, duplicate) -> first
                ));

        int score = 0;

        for (Question question : quiz.getQuestions()) {
            Response submitted = submittedAnswers.get(question.getId());

            if (submitted != null
                    && submitted.getResponse() != null
                    && submitted.getResponse().trim()
                    .equalsIgnoreCase(question.getRightAnswer().trim())) {
                score++;
            }
        }

        return score;
    }
}