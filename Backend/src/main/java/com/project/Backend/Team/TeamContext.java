package com.project.Backend.Team;

public record TeamContext(
        boolean isTeamSubmission,
        String teamId,
        String submittedBy) {
    public static TeamContext individual(String studentId) {
        return new TeamContext(false, null, studentId);
    }

    public static TeamContext team(String teamId, String leaderId) {
        return new TeamContext(true, teamId, leaderId);
    }
}
