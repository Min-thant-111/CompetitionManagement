package com.project.Backend.Submission;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.project.Backend.Evaluation.Evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "submissions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Submission {

    @Id
    private String submissionId;

    private String competitionId;
    private String submittedBy;
    private String teamId;

    private String submissionType; // QUIZ, ASSIGNMENT, PROJECT

    private String repoLink; // PROJECT
    private String file; // ASSIGNMENT
    private List<String> quizAnswers; // QUIZ
    private Integer marksAwarded;
    private boolean isTeamSubmission;
    private String description;
    private SubmissionStatus submissionStatus; // student ==> pending, submitted, teacher ==> submitted, evaluated
    private String feedback;
    private Evaluation evaluation;
    private LocalDateTime submittedAt;
}
