package com.project.Backend.CompetitionRegistration;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.project.Backend.Competition.Competition;
import com.project.Backend.Competition.CompetitionRepository;
import com.project.Backend.CompetitionRegistration.RequestDTO.CompetitionRegistrationRequestDTO;
import com.project.Backend.CompetitionRegistration.ResponseDTO.CompetitionRegistrationResponseDTO;
import com.project.Backend.Team.Team;
import com.project.Backend.Team.TeamRepository;
import com.project.Backend.Team.TeamStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompetitionRegistrationService {

        private final CompetitionRepository competitionRepository;
        private final CompetitionRegistrationRepository registrationRepository;
        private final TeamRepository teamRepository;

        public CompetitionRegistrationResponseDTO register(
                        CompetitionRegistrationRequestDTO dto,
                        String studentId) {
                if (dto == null) {
                        throw new IllegalArgumentException("Request body is required");
                }

                Competition competition = competitionRepository.findById(dto.competitionId())
                                .orElseThrow(() -> new IllegalArgumentException("Competition not found"));

                if (competition.getRegistrationDeadline() != null
                                && LocalDateTime.now().isAfter(competition.getRegistrationDeadline())) {
                        throw new IllegalStateException("Registration deadline passed");
                }

                String type = competition.getParticipationType();
                if (type == null || type.isBlank()) {
                        throw new IllegalStateException("Competition participation type is not configured");
                }

                // ============ INDIVIDUAL ============
                if ("INDIVIDUAL".equalsIgnoreCase(type)) {

                        if (dto.teamId() != null) {
                                throw new IllegalStateException(
                                                "Team not allowed for individual competition");
                        }

                        if (registrationRepository
                                        .existsByCompetitionIdAndStudentId(dto.competitionId(), studentId)) {
                                throw new IllegalStateException("Already registered");
                        }

                        CompetitionRegistration reg = CompetitionRegistrationMapper.newIndividual(
                                        dto.competitionId(),
                                        studentId);

                        return CompetitionRegistrationMapper.toResponse(
                                        registrationRepository.save(reg));
                }

                if (!"TEAM".equalsIgnoreCase(type)) {
                        throw new IllegalStateException("Unsupported participation type");
                }

                if (dto.teamId() == null || dto.teamId().isBlank()) {
                        throw new IllegalStateException("Team is required for team competition");
                }

                // ============ TEAM ============
                Team team = teamRepository.findById(dto.teamId())
                                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

                if (!dto.competitionId().equals(team.getCompetitionId())) {
                        throw new IllegalStateException("Team does not belong to this competition");
                }

                if (!team.getLeaderId().equals(studentId)) {
                        throw new IllegalStateException("Only team leader can register");
                }

                if (team.getStatus() != TeamStatus.ACTIVE) {
                        throw new IllegalStateException("Team is not active");
                }

                if (registrationRepository
                                .existsByCompetitionIdAndTeamId(dto.competitionId(), team.getTeamId())) {
                        throw new IllegalStateException("Team already registered");
                }

                CompetitionRegistration reg = CompetitionRegistrationMapper.newTeam(
                                dto.competitionId(),
                                team.getTeamId());

                return CompetitionRegistrationMapper.toResponse(
                                registrationRepository.save(reg));
        }
}
