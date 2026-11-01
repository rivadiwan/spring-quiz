package com.hittry.quizapp.controller;

import com.hittry.quizapp.model.QuestionWrapper;
import com.hittry.quizapp.model.Response;
import com.hittry.quizapp.service.QuizService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/create")
    public Integer createQuiz(
            @RequestParam String category,
            @RequestParam int numQuestions,
            @RequestParam String title
    ) {
        return quizService.createQuiz(category, numQuestions, title);
    }

    @GetMapping("/get/{id}")
    public List<QuestionWrapper> getQuizQuestions(@PathVariable Integer id) {
        return quizService.getQuizQuestions(id);
    }

    @PostMapping("/submit/{id}")
    public Integer submitQuiz(
            @PathVariable Integer id,
            @RequestBody List<Response> responses
    ) {
        return quizService.calculateResult(id, responses);
    }
}