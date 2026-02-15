package com.project.Backend.Team.RequestDTO;

import java.util.List;

public record CreateTeamRequestDTO(
        String competitionId,
        String teamName,
        List<String> invitedMemberIds
) {
}
