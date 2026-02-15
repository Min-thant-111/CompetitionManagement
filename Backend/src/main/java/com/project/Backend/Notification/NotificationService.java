package com.project.Backend.Notification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public void registerEmitter(String userId, SseEmitter emitter) {
        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
    }

    public void unregisterEmitter(String userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> list = emitters.get(userId);
        if (list != null) {
            list.remove(emitter);
        }
    }

    private void pushToUser(String userId, Notification notification) {
        CopyOnWriteArrayList<SseEmitter> list = emitters.get(userId);
        if (list == null)
            return;
        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(notification));
            } catch (Exception e) {
                unregisterEmitter(userId, emitter);
                try {
                    emitter.complete();
                } catch (Exception ignored) {
                }
            }
        }
    }

    public Notification createNotification(String recipientId, String title, String message, NotificationType type,
            String relatedEntityId) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        Notification saved = notificationRepository.save(notification);
        pushToUser(recipientId, saved);
        return saved;
    }

    // Helper methods for specific notification flows

    public void sendCompetitionCreatedNotification(String recipientId, String competitionName, String competitionId) {
        createNotification(
                recipientId,
                "New Competition Created",
                "A new competition '" + competitionName + "' has been created.",
                NotificationType.COMPETITION_CREATED,
                competitionId);
    }

    public void sendTeamInvitationNotification(String recipientId, String teamName, String teamId) {
        createNotification(
                recipientId,
                "Team Invitation",
                "You have been invited to join team '" + teamName + "'.",
                NotificationType.TEAM_INVITATION,
                teamId);
    }

    public void sendTeamConfirmationNotification(String recipientId, String teamName, String teamId) {
        createNotification(
                recipientId,
                "Team Joined",
                "You have successfully joined team '" + teamName + "'.",
                NotificationType.TEAM_CONFIRMATION,
                teamId);
    }

    public void sendSubmissionSuccessNotification(String recipientId, String competitionName, String submissionId) {
        createNotification(
                recipientId,
                "Submission Successful",
                "Your submission for '" + competitionName + "' was successful.",
                NotificationType.SUBMISSION_SUCCESS,
                submissionId);
    }

    public void sendAchievementEarnedNotification(String recipientId, String achievementName, String achievementId) {
        createNotification(
                recipientId,
                "Achievement Unlocked!",
                "You have earned the achievement: " + achievementName,
                NotificationType.ACHIEVEMENT_EARNED,
                achievementId);
    }

    public void sendAttendanceRecoveryApprovalNotification(String recipientId, String date, String recoveryId) {
        createNotification(
                recipientId,
                "Attendance Recovery Approved",
                "Your attendance recovery request for " + date + " has been approved.",
                NotificationType.ATTENDANCE_RECOVERY_APPROVAL,
                recoveryId);
    }

    public void sendRejectionNotification(String recipientId, String context, String reason, String entityId) {
        createNotification(
                recipientId,
                "Request Rejected",
                "Your request regarding " + context + " was rejected. Reason: " + reason,
                NotificationType.REJECTION,
                entityId);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByRecipientIdAndIsReadFalse(userId);
    }

    public Notification markAsRead(String notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            Notification saved = notificationRepository.save(notification);
            pushToUser(notification.getRecipientId(), saved);
            return saved;
        }
        return null;
    }

    public Notification markAsReadForUser(String notificationId, String userId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            return null;
        }
        Notification notification = notificationOpt.get();
        if (!notification.getRecipientId().equals(userId)) {
            throw new IllegalStateException("Not authorized to update this notification");
        }
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        pushToUser(notification.getRecipientId(), saved);
        return saved;
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        unread.forEach(n -> pushToUser(userId, n));
    }
}
