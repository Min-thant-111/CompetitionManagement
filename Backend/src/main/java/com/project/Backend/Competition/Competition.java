package com.project.Backend.Competition;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "competitions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Competition {

    @Id
    private String competitionId;

    private String title;

    private String competitionType; // INTERNAL | EXTERNAL

    private String format; // QUIZ | ASSIGNMENT | PROJECT

    private String participationType; // INDIVIDUAL | TEAM

    private String createdBy; // teacherId / adminId

    private LocalDateTime registrationDeadline;
    private LocalDateTime submissionDeadline;

    private Integer quizDurationMinutes; // quiz only

    private LocalDateTime proofDeadline; // external only

    private Integer totalMarks;

    private Integer minTeamSize; // team only
    private Integer maxTeamSize; // team only

    private String materials; // PDF / link / instructions
}
