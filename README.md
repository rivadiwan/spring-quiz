# Spring Boot Quiz App Backend

A robust RESTful backend API for a Quiz Application built with Spring Boot, Spring Data JPA, and PostgreSQL. It supports random quiz generation by category, dynamic question fetching without exposing answers, and automated score calculation.

## Tech Stack
* **Java** (JDK 17+)
* **Spring Boot**
* **Spring Data JPA** (Hibernate)
* **PostgreSQL**
* **Lombok**
* **Maven**

## Project Architecture
* **Entity**: Maps to PostgreSQL database tables (`Question`, `Quiz`).
* **Model**: DTOs for data transfer (`QuestionWrapper`, `Response`).
* **Repository**: Spring Data JPA interfaces for database operations.
* **Service**: Core business logic (random question picking, scoring algorithm).
* **Controller**: REST endpoints for managing questions, creating quizzes, and submitting answers.

## Setup & Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/rivadiwan/spring-quiz.git
   cd spring-quiz
2. Configure PostgreSQL
   Update your src/main/resources/application.properties with your database credentials:

    Properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/your_database_name
    spring.datasource.username=your_username
    spring.datasource.password=your_password
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true
    Build and Run

3. Bash
    mvn clean compile
    mvn spring-boot:run
4. API Endpoints
    Questions
    Get All Questions: GET /question/allQuestions

    Add Question: POST /question/add

    Quizzes
    Create Quiz: POST /quiz/create?category=Java&numQuestions=5&title=Java Basics

    Get Quiz Questions: GET /quiz/get/{id} (Excludes correct answers)

    Submit Quiz & Get Score: POST /quiz/submit/{id}

    Request Body Example:

    JSON
    [
    { "id": 11, "response": "extends" },
    { "id": 12, "response": "main()" }
    ]

5. After running the code in terminal using mvn spring-boot::run
6. search "http://localhost:8080/" on browser and can see the working project.