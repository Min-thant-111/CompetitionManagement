package com.project.Backend.Evaluation.DTO;

import java.time.LocalDateTime;

import com.project.Backend.Submission.ResponseDTO.SubmissionCoreDTO;

public record EvaluationResponseDTO(
        SubmissionCoreDTO submission,
        Integer marksAwarded,
        String feedback,
        LocalDateTime evaluatedAt) {

    public EvaluationResponseDTO(Integer marksAwarded, String feedback, LocalDateTime evaluatedAt) {
        this(null, marksAwarded, feedback, evaluatedAt);
    }
}
