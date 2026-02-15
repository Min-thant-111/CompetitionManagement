package com.project.Backend.MyExternalParticipation;

import com.project.Backend.User.ResponseDTO.MessageResponse;
import com.project.Backend.User.UserRepository;
import com.project.Backend.Auth.security.jwt.JwtUtils;
import com.project.Backend.Auth.security.services.UserDetailsImpl;
import com.project.Backend.Notification.NotificationType;
import com.project.Backend.Notification.NotificationService;
import com.project.Backend.User.Role;
import com.project.Backend.User.User;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/external/participations")
public class ExternalParticipationController {
    @Autowired
    private ExternalParticipationRepository repository;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private GridFsTemplate gridFsTemplate;

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        try {
            Object principalObj = auth.getPrincipal();
            if (principalObj instanceof UserDetailsImpl principal) {
                return principal.getId();
            }
        } catch (Exception ignored) {
        }
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest req = attrs.getRequest();
                String header = req.getHeader("Authorization");
                if (header != null && header.startsWith("Bearer ")) {
                    String token = header.substring(7);
                    if (jwtUtils.validateJwtToken(token)) {
                        String subject = jwtUtils.getUserNameFromJwtToken(token);
                        Optional<User> userOpt = userRepository.findByUsername(subject);
                        if (userOpt.isEmpty()) {
                            userOpt = userRepository.findByEmail(subject);
                        }
                        if (userOpt.isPresent()) {
                            return userOpt.get().getId();
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public List<ExternalParticipation> listMine() {
        String uid = currentUserId();
        if (uid == null)
            return List.of();
        return repository.findByOwnerIdOrderBySubmittedAtDesc(uid);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getOne(@PathVariable String id) {
        Optional<ExternalParticipation> opt = repository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        ExternalParticipation ep = opt.get();
        if (!ep.getOwnerId().equals(currentUserId()))
            return ResponseEntity.status(403).build();
        return ResponseEntity.ok(ep);
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> create(@RequestBody ExternalParticipation body) {
        String uid = currentUserId();
        if (uid == null)
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        ExternalParticipation ep = new ExternalParticipation();
        ep.setOwnerId(uid);
        ep.setTitle(body.getTitle());
        ep.setCategory(body.getCategory());
        ep.setOrganizer(body.getOrganizer());
        ep.setMode(body.getMode());
        ep.setLocation(body.getLocation());
        ep.setScale(body.getScale());
        ep.setDescription(body.getDescription());
        ep.setEligibility(body.getEligibility());
        ep.setParticipationType(body.getParticipationType());
        ep.setTeamSizeMin(body.getTeamSizeMin());
        ep.setTeamSizeMax(body.getTeamSizeMax());
        ep.setWebsiteLink(body.getWebsiteLink());
        ep.setParticipationResult(body.getParticipationResult());
        ep.setStartDate(parseDate(body.getStartDate()));
        ep.setEndDate(parseDate(body.getEndDate()));
        List<String> initialProofs = body.getProofFiles() != null ? new ArrayList<>(body.getProofFiles())
                : new ArrayList<>();
        ep.setProofFiles(initialProofs);
        ep.setPrizes(body.getPrizes());
        ep.setRegistrationFeeType(body.getRegistrationFeeType());
        ep.setRegistrationFeeAmount(body.getRegistrationFeeAmount());
        ep.setRegistrationFeeCurrency(body.getRegistrationFeeCurrency());
        ep.setSubmissionNotes(body.getSubmissionNotes());
        ep.setSourceConfirmation(body.getSourceConfirmation());
        ep.setDeclarationConfirmed(body.getDeclarationConfirmed());
        ep.setSource("student_created");
        ep.setStatus("pending");
        ep.setSubmittedAt(LocalDate.now());
        ep.setCreatedAt(LocalDateTime.now());
        ep.setUpdatedAt(LocalDateTime.now());
        ExternalParticipation saved = repository.save(ep);
        notifyAdmins(saved, "Submitted");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody ExternalParticipation body) {
        Optional<ExternalParticipation> opt = repository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        ExternalParticipation ep = opt.get();
        String uid = currentUserId();
        if (uid == null)
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        if (!ep.getOwnerId().equals(uid))
            return ResponseEntity.status(403).build();
        ep.setTitle(body.getTitle());
        ep.setCategory(body.getCategory());
        ep.setOrganizer(body.getOrganizer());
        ep.setMode(body.getMode());
        ep.setLocation(body.getLocation());
        ep.setScale(body.getScale());
        ep.setDescription(body.getDescription());
        ep.setEligibility(body.getEligibility());
        ep.setParticipationType(body.getParticipationType());
        ep.setTeamSizeMin(body.getTeamSizeMin());
        ep.setTeamSizeMax(body.getTeamSizeMax());
        ep.setWebsiteLink(body.getWebsiteLink());
        ep.setParticipationResult(body.getParticipationResult());
        ep.setStartDate(parseDate(body.getStartDate()));
        ep.setEndDate(parseDate(body.getEndDate()));
        ep.setPrizes(body.getPrizes());
        ep.setRegistrationFeeType(body.getRegistrationFeeType());
        ep.setRegistrationFeeAmount(body.getRegistrationFeeAmount());
        ep.setRegistrationFeeCurrency(body.getRegistrationFeeCurrency());
        ep.setSubmissionNotes(body.getSubmissionNotes());
        ep.setSourceConfirmation(body.getSourceConfirmation());
        ep.setDeclarationConfirmed(body.getDeclarationConfirmed());
        ep.setSource("student_created");
        ep.setStatus("pending");
        ep.setSubmittedAt(LocalDate.now());
        ep.setUpdatedAt(LocalDateTime.now());
        ExternalParticipation saved = repository.save(ep);
        notifyAdmins(saved, "Resubmitted");
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/proof")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadProof(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        Optional<ExternalParticipation> opt = repository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        ExternalParticipation ep = opt.get();
        if (!ep.getOwnerId().equals(currentUserId()))
            return ResponseEntity.status(403).build();
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Empty file"));
        }
        try {
            DBObject metaData = new BasicDBObject();
            metaData.put("type", "proof");
            metaData.put("participationId", id);
            metaData.put("contentType", file.getContentType());

            String filename = "proof_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
            ObjectId fileId = gridFsTemplate.store(file.getInputStream(), filename, file.getContentType(), metaData);

            String url = "/api/files/" + fileId.toString();
            List<String> proofs = ep.getProofFiles();
            proofs = proofs != null ? new ArrayList<>(proofs) : new ArrayList<>();
            proofs.add(url);
            ep.setProofFiles(proofs);
            repository.save(ep);
            return ResponseEntity.ok(new MessageResponse(url));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: Upload failed"));
        }
    }

    private LocalDate parseDate(LocalDate d) {
        return d;
    }

    private void notifyAdmins(ExternalParticipation ep, String actionLabel) {
        List<User> admins = userRepository.findByRoles(Role.ROLE_ADMIN);
        if (admins == null || admins.isEmpty())
            return;
        User owner = userRepository.findById(ep.getOwnerId()).orElse(null);
        String ownerName = owner != null && owner.getFullName() != null && !owner.getFullName().isBlank()
                ? owner.getFullName()
                : owner != null ? owner.getUsername() : "A student";
        String title = "External Participation " + actionLabel;
        String message = ownerName + " " + actionLabel.toLowerCase()
                + " an external participation: " + (ep.getTitle() != null ? ep.getTitle() : "Untitled");
        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getId(),
                    title,
                    message,
                    NotificationType.EXTERNAL_PARTICIPATION_SUBMITTED,
                    ep.getId());
        }
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminApprovalItem> listForAdmin(
            @RequestParam(value = "status", required = false, defaultValue = "pending") String status,
            @RequestParam(value = "source", required = false) String source) {
        List<ExternalParticipation> base;
        if ("all".equals(status)) {
            if (source != null && !source.isEmpty() && !"all".equals(source)) {
                base = repository.findAll().stream()
                        .filter(ep -> source.equals(ep.getSource()))
                        .sorted((a, b) -> {
                            LocalDate d1 = a.getSubmittedAt() != null ? a.getSubmittedAt() : LocalDate.MIN;
                            LocalDate d2 = b.getSubmittedAt() != null ? b.getSubmittedAt() : LocalDate.MIN;
                            return d2.compareTo(d1);
                        })
                        .toList();
            } else {
                base = repository.findAll().stream()
                        .sorted((a, b) -> {
                            LocalDate d1 = a.getSubmittedAt() != null ? a.getSubmittedAt() : LocalDate.MIN;
                            LocalDate d2 = b.getSubmittedAt() != null ? b.getSubmittedAt() : LocalDate.MIN;
                            return d2.compareTo(d1);
                        })
                        .toList();
            }
        } else {
            if (source != null && !source.isEmpty() && !"all".equals(source)) {
                base = repository.findByStatusAndSourceOrderBySubmittedAtDesc(status, source);
            } else {
                base = repository.findByStatusOrderBySubmittedAtDesc(status);
            }
        }
        List<AdminApprovalItem> out = new ArrayList<>();
        for (ExternalParticipation ep : base) {
            AdminApprovalItem item = new AdminApprovalItem();
            item.id = ep.getId();
            item.type = "student_created";
            item.source = ep.getSource() != null ? ep.getSource() : "student_created";
            var userOpt = userRepository.findById(ep.getOwnerId());
            String fullName = userOpt.map(User::getFullName).orElse("Unknown");
            String username = userOpt.map(User::getUsername).orElse("Unknown");
            String email = userOpt.map(User::getEmail).orElse("");
            item.student = new StudentInfo(fullName != null && !fullName.isEmpty() ? fullName : username, email,
                    username);
            item.competition = ep.getTitle();
            item.category = ep.getCategory() != null ? ep.getCategory() : "other";
            item.organizer = ep.getOrganizer();
            item.mode = ep.getMode();
            item.location = ep.getLocation();
            item.scale = ep.getScale();
            item.description = ep.getDescription();
            item.eligibility = ep.getEligibility();
            item.participationType = ep.getParticipationType();
            item.teamSizeMin = ep.getTeamSizeMin();
            item.teamSizeMax = ep.getTeamSizeMax();
            item.startDate = ep.getStartDate() != null ? ep.getStartDate().toString() : null;
            item.endDate = ep.getEndDate() != null ? ep.getEndDate().toString() : null;
            item.websiteLink = ep.getWebsiteLink();
            item.result = ep.getParticipationResult() != null ? ep.getParticipationResult() : "Participation";
            item.proofFiles = ep.getProofFiles() != null ? ep.getProofFiles() : List.of();
            item.prizes = ep.getPrizes();
            item.registrationFeeType = ep.getRegistrationFeeType();
            item.registrationFeeAmount = ep.getRegistrationFeeAmount();
            item.registrationFeeCurrency = ep.getRegistrationFeeCurrency();
            item.submissionNotes = ep.getSubmissionNotes();
            item.sourceConfirmation = ep.getSourceConfirmation();
            item.declarationConfirmed = ep.getDeclarationConfirmed();
            item.submittedAt = ep.getSubmittedAt() != null ? ep.getSubmittedAt().toString()
                    : LocalDate.now().toString();
            item.status = ep.getStatus() != null ? ep.getStatus() : "pending";
            item.notes = ep.getAdminNote();
            out.add(item);
        }
        return out;
    }

    public static class AdminApprovalItem {
        public String id;
        public String type;
        public String source;
        public StudentInfo student;
        public String competition;
        public String category;
        public String organizer;
        public String mode;
        public String location;
        public String scale;
        public String description;
        public String eligibility;
        public String participationType;
        public Integer teamSizeMin;
        public Integer teamSizeMax;
        public String startDate;
        public String endDate;
        public String websiteLink;
        public String result;
        public List<String> proofFiles;
        public String prizes;
        public String registrationFeeType;
        public Double registrationFeeAmount;
        public String registrationFeeCurrency;
        public String submissionNotes;
        public String sourceConfirmation;
        public Boolean declarationConfirmed;
        public String submittedAt;
        public String status;
        public String notes;
    }

    public static class StudentInfo {
        public String name;
        public String email;
        public String studentId;

        public StudentInfo(String name, String email, String studentId) {
            this.name = name;
            this.email = email;
            this.studentId = studentId;
        }
    }

    public static class AdminAction {
        public String notes;
        public String reason;
    }

    public static class BulkAction {
        public List<String> ids;
        public String notes;
        public String reason;
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approve(@PathVariable String id, @RequestBody(required = false) AdminAction action) {
        Optional<ExternalParticipation> opt = repository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        ExternalParticipation ep = opt.get();
        ep.setStatus("approved");
        if (action != null && action.notes != null && !action.notes.isBlank()) {
            ep.setAdminNote(action.notes);
        }
        ep.setUpdatedAt(LocalDateTime.now());
        repository.save(ep);

        // Send notification
        notificationService.createNotification(
                ep.getOwnerId(),
                "Participation Approved",
                "Your participation in '" + ep.getTitle() + "' has been approved by the admin.",
                NotificationType.GENERAL,
                ep.getId());

        return ResponseEntity.ok(new MessageResponse("approved"));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reject(@PathVariable String id, @RequestBody(required = false) AdminAction action) {
        Optional<ExternalParticipation> opt = repository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        ExternalParticipation ep = opt.get();
        ep.setStatus("rejected");
        String reason = action != null ? (action.reason != null ? action.reason : action.notes) : null;
        if (reason != null && !reason.isBlank()) {
            ep.setAdminNote(reason);
        }
        ep.setUpdatedAt(LocalDateTime.now());
        repository.save(ep);

        // Send notification
        notificationService.createNotification(
                ep.getOwnerId(),
                "Participation Rejected",
                "Your participation in '" + ep.getTitle() + "' was rejected. Reason: "
                        + (reason != null ? reason : "No reason provided."),
                NotificationType.REJECTION,
                ep.getId());

        return ResponseEntity.ok(new MessageResponse("rejected"));
    }

    @PatchMapping("/{id}/rollback")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rollback(@PathVariable String id) {
        Optional<ExternalParticipation> opt = repository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.notFound().build();
        ExternalParticipation ep = opt.get();
        ep.setStatus("pending");
        ep.setUpdatedAt(LocalDateTime.now());
        repository.save(ep);

        // Send notification
        notificationService.createNotification(
                ep.getOwnerId(),
                "Participation Rollback",
                "Your participation in '" + ep.getTitle() + "' has been rolled back to pending by the admin.",
                NotificationType.ROLLBACK,
                ep.getId());

        return ResponseEntity.ok(new MessageResponse("pending"));
    }

    @PatchMapping("/bulk/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkApprove(@RequestBody BulkAction action) {
        if (action == null || action.ids == null || action.ids.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: ids required"));
        }
        List<ExternalParticipation> items = repository.findAllById(action.ids);
        for (ExternalParticipation ep : items) {
            ep.setStatus("approved");
            if (action.notes != null && !action.notes.isBlank()) {
                ep.setAdminNote(action.notes);
            }
            ep.setUpdatedAt(LocalDateTime.now());

            // Send notification
            notificationService.createNotification(
                    ep.getOwnerId(),
                    "Participation Approved (Bulk)",
                    "Your participation in '" + ep.getTitle() + "' has been approved.",
                    NotificationType.GENERAL,
                    ep.getId());
        }
        repository.saveAll(items);
        return ResponseEntity.ok(new MessageResponse("bulk_approved"));
    }

    @PatchMapping("/bulk/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkReject(@RequestBody BulkAction action) {
        if (action == null || action.ids == null || action.ids.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: ids required"));
        }
        String reason = action.reason != null ? action.reason : action.notes;
        List<ExternalParticipation> items = repository.findAllById(action.ids);
        for (ExternalParticipation ep : items) {
            ep.setStatus("rejected");
            if (reason != null && !reason.isBlank()) {
                ep.setAdminNote(reason);
            }
            ep.setUpdatedAt(LocalDateTime.now());

            // Send notification
            notificationService.createNotification(
                    ep.getOwnerId(),
                    "Participation Rejected (Bulk)",
                    "Your participation in '" + ep.getTitle() + "' was rejected.",
                    NotificationType.REJECTION,
                    ep.getId());
        }
        repository.saveAll(items);
        return ResponseEntity.ok(new MessageResponse("bulk_rejected"));
    }
}
