package com.project.Backend.Evaluation;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.project.Backend.Evaluation.DTO.EvaluationRequestDTO;
import com.project.Backend.Evaluation.DTO.EvaluationResponseDTO;

@Component
public class EvaluationMapper {

    public Evaluation toEvaluation(EvaluationRequestDTO dto) {
        return Evaluation.builder()
                .marksAwarded(dto.marksAwarded())
                .feedback(dto.feedback())
                .evaluatedAt(LocalDateTime.now()) // set timestamp automatically
                .build();
    }

    public EvaluationResponseDTO toResponseDTO(Evaluation evaluation) {
        if (evaluation == null)
            return null;
        return new EvaluationResponseDTO(
                evaluation.getMarksAwarded(),
                evaluation.getFeedback(),
                evaluation.getEvaluatedAt());
    }
}
