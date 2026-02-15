package com.project.Backend.CompetitionRegistration.RequestDTO;

public record CompetitionRegistrationRequestDTO(
        String competitionId,
        String teamId // null for individual
) {
}