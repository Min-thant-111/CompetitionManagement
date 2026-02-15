package com.project.Backend.Submission.RequestDTO;

public record AssignmentSubmissionRequestDTO(
        String file, // zip / pdf / docx (stored path or filename)
        String description) {

}
