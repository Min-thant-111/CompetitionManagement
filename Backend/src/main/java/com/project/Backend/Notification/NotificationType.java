package com.project.Backend.Notification;

public enum NotificationType {
    COMPETITION_CREATED,
    TEAM_INVITATION,
    TEAM_CONFIRMATION,     // Team invitations and confirmations
    SUBMISSION_SUCCESS,    // Submission success
    ACHIEVEMENT_EARNED,    // Achievement earned
    ATTENDANCE_RECOVERY_APPROVAL, // Attendance recovery approval
    REJECTION,             // Rejection actions
    ROLLBACK,              // Rollback actions
    EXTERNAL_PARTICIPATION_SUBMITTED, // Student submitted external participation
    GENERAL
}
