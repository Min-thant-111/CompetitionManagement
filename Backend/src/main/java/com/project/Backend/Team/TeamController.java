package com.project.Backend.Team;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.Backend.Auth.security.services.UserDetailsImpl;
import com.project.Backend.Team.RequestDTO.CreateTeamRequestDTO;
import com.project.Backend.Team.RequestDTO.AcceptTeamInvitationRequestDTO;
import com.project.Backend.Team.ResponseDTO.TeamResponseDTO;
import com.project.Backend.User.ResponseDTO.MessageResponse;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/teams")
@PreAuthorize("hasRole('STUDENT')")
@AllArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public ResponseEntity<?> listTeams(@RequestParam(value = "competitionId", required = false) String competitionId) {
        if (competitionId == null || competitionId.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("competitionId is required"));
        }
        List<TeamResponseDTO> teams = teamService.listTeamsByCompetition(competitionId);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/my")
    public ResponseEntity<?> listMyTeams() {
        String studentId = currentUserId();
        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Unauthorized"));
        }
        List<TeamResponseDTO> teams = teamService.listTeamsForUser(studentId);
        return ResponseEntity.ok(teams);
    }

    @PostMapping
    public ResponseEntity<?> createTeam(@RequestBody CreateTeamRequestDTO request) {
        String studentId = currentUserId();
        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Unauthorized"));
        }
        if (request == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Request body is required"));
        }
        try {
            TeamResponseDTO response = teamService.createTeam(request, studentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }

    @PostMapping("/{teamId}/join")
    public ResponseEntity<?> joinTeam(@PathVariable String teamId) {
        String studentId = currentUserId();
        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Unauthorized"));
        }
        try {
            TeamResponseDTO response = teamService.joinTeam(teamId, studentId);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }

    @PostMapping("/{teamId}/accept-invitation")
    public ResponseEntity<?> acceptInvitation(@PathVariable String teamId) {
        String studentId = currentUserId();
        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Unauthorized"));
        }
        try {
            AcceptTeamInvitationRequestDTO dto = new AcceptTeamInvitationRequestDTO(teamId);
            TeamResponseDTO response = teamService.acceptInvitation(dto, studentId);
            return ResponseEntity.ok(response);
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
