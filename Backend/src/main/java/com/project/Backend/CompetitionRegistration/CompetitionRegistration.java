package com.project.Backend.CompetitionRegistration;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "competition_registrations")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompetitionRegistration {

    @Id
    private String id;

    private String competitionId;

    // INDIVIDUAL
    private String studentId;

    // TEAM
    private String teamId;

    private boolean teamRegistration;

    private RegistrationStatus status; // REGISTERED, CANCELLED

    private LocalDateTime registeredAt;
}