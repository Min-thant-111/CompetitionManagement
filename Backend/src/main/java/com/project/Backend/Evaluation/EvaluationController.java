package com.project.Backend.Evaluation;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.Backend.Evaluation.DTO.EvaluationRequestDTO;
import com.project.Backend.Evaluation.DTO.EvaluationResponseDTO;
import com.project.Backend.User.ResponseDTO.MessageResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/evaluation")
@PreAuthorize("hasRole('TEACHER')")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/{submissionId}")
    public ResponseEntity<?> evaluateSubmission(
            @PathVariable String submissionId,
            @RequestBody @Valid EvaluationRequestDTO dto) {
        try {
            EvaluationResponseDTO response = evaluationService.evaluateSubmission(submissionId, dto, "someString");
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }
}
