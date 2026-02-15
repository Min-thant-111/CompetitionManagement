package com.project.Backend.CompetitionRegistration;

import java.time.LocalDateTime;

import com.project.Backend.CompetitionRegistration.ResponseDTO.CompetitionRegistrationResponseDTO;

public class CompetitionRegistrationMapper {

        private CompetitionRegistrationMapper() {
        }

        public static CompetitionRegistration newIndividual(
                        String competitionId,
                        String studentId) {
                return CompetitionRegistration.builder()
                                .competitionId(competitionId)
                                .studentId(studentId)
                                .teamId(null)
                                .teamRegistration(false)
                                .status(RegistrationStatus.REGISTERED)
                                .registeredAt(LocalDateTime.now())
                                .build();
        }

        public static CompetitionRegistration newTeam(
                        String competitionId,
                        String teamId) {
                return CompetitionRegistration.builder()
                                .competitionId(competitionId)
                                .teamId(teamId)
                                .studentId(null)
                                .teamRegistration(true)
                                .status(RegistrationStatus.REGISTERED)
                                .registeredAt(LocalDateTime.now())
                                .build();
        }

        public static CompetitionRegistrationResponseDTO toResponse(
                        CompetitionRegistration r) {
                return new CompetitionRegistrationResponseDTO(
                                r.getId(),
                                r.getCompetitionId(),
                                r.getStudentId(),
                                r.getTeamId(),
                                r.getStatus(),
                                r.getRegisteredAt());
        }
}
