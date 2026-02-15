package com.project.Backend.CompetitionRegistration;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.Backend.Auth.security.services.UserDetailsImpl;
import com.project.Backend.CompetitionRegistration.RequestDTO.CompetitionRegistrationRequestDTO;
import com.project.Backend.CompetitionRegistration.ResponseDTO.CompetitionRegistrationResponseDTO;
import com.project.Backend.Team.Team;
import com.project.Backend.Team.TeamRepository;
import com.project.Backend.User.ResponseDTO.MessageResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/competitions")
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class CompetitionRegistrationController {

    private final CompetitionRegistrationService registrationService;
    private final CompetitionRegistrationRepository registrationRepository;
    private final TeamRepository teamRepository;

    @GetMapping("/registrations/me")
    public ResponseEntity<?> myRegistrations() {
        String studentId = currentUserId();
        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Unauthorized"));
        }

        List<CompetitionRegistration> out = new ArrayList<>();
        out.addAll(registrationRepository.findByStudentIdAndStatus(studentId, RegistrationStatus.REGISTERED));

        List<String> teamIds = teamRepository
                .findByLeaderIdOrAcceptedMemberIdsContaining(studentId, studentId)
                .stream()
                .map(Team::getTeamId)
                .toList();

        if (!teamIds.isEmpty()) {
            out.addAll(registrationRepository.findByTeamIdInAndStatus(teamIds, RegistrationStatus.REGISTERED));
        }

        List<CompetitionRegistrationResponseDTO> resp = out.stream()
                .map(CompetitionRegistrationMapper::toResponse)
                .toList();

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{competitionId}/registrations")
    public ResponseEntity<?> register(
            @PathVariable String competitionId,
            @RequestBody CompetitionRegistrationRequestDTO request) {
        String studentId = currentUserId();
        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Unauthorized"));
        }
        if (request == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Request body is required"));
        }
        // enforce competitionId from path
        CompetitionRegistrationRequestDTO dto = new CompetitionRegistrationRequestDTO(
                competitionId,
                request.teamId());

        try {
            CompetitionRegistrationResponseDTO response = registrationService.register(dto, studentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl principal) {
            return principal.getId();
        }
        return null;
    }
}
