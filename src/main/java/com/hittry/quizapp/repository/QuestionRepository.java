package com.hittry.quizapp.repository;

import com.hittry.quizapp.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Integer> {

    List<Question> findByCategory(String category);

    @Query(value = """
            SELECT *
            FROM question
            WHERE category = :category
            ORDER BY RANDOM()
            LIMIT :numQuestions
            """, nativeQuery = true)
    List<Question> findRandomQuestionsByCategory(
            @Param("category") String category,
            @Param("numQuestions") int numQuestions
    );
}