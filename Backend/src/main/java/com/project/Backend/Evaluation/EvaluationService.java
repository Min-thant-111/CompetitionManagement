package com.project.Backend.Evaluation;

import org.springframework.stereotype.Service;

import com.project.Backend.Competition.Competition;
import com.project.Backend.Competition.CompetitionRepository;
import com.project.Backend.Evaluation.DTO.EvaluationRequestDTO;
import com.project.Backend.Evaluation.DTO.EvaluationResponseDTO;
import com.project.Backend.Submission.Submission;
import com.project.Backend.Submission.SubmissionRepository;
import com.project.Backend.Submission.SubmissionStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final SubmissionRepository submissionRepository;
    private final CompetitionRepository competitionRepository;
    private final EvaluationMapper evaluationMapper;

    public EvaluationResponseDTO evaluateSubmission(String submissionId, EvaluationRequestDTO dto, String teacherId) {
        if (dto == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));

        if (submission.getSubmissionStatus() != SubmissionStatus.SUBMITTED) {
            throw new IllegalStateException("Submission cannot be evaluated in current status");
        }

        Competition competition = competitionRepository.findById(submission.getCompetitionId())
                .orElseThrow(() -> new IllegalArgumentException("Competition not found"));

        if (!"INTERNAL".equalsIgnoreCase(competition.getCompetitionType())) {
            throw new IllegalStateException("Only internal competition submissions can be evaluated");
        }

        if (teacherId == null || !teacherId.equals(competition.getCreatedBy())) {
            throw new IllegalStateException("Teacher can only evaluate submissions from competitions they created");
        }

        Evaluation evaluation = evaluationMapper.toEvaluation(dto);
        submission.setEvaluation(evaluation);
        submission.setSubmissionStatus(SubmissionStatus.EVALUATED); // update status
        submissionRepository.save(submission);

        return evaluationMapper.toResponseDTO(evaluation);
    }
}
