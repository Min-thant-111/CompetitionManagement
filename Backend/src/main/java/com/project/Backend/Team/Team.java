package com.project.Backend.Team;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "teams")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Team {

    @Id
    private String teamId;

    private String teamName;
    private String competitionId;

    private String leaderId;

    // invited users
    private List<String> invitedMemberIds;

    // accepted users
    private List<String> acceptedMemberIds;

    private TeamStatus status; // INACTIVE | ACTIVE
}
