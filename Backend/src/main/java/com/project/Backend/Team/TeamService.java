package com.project.Backend.Team;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.project.Backend.Competition.Competition;
import com.project.Backend.Competition.CompetitionRepository;
import com.project.Backend.CompetitionRegistration.CompetitionRegistration;
import com.project.Backend.CompetitionRegistration.CompetitionRegistrationMapper;
import com.project.Backend.CompetitionRegistration.CompetitionRegistrationRepository;
import com.project.Backend.CompetitionRegistration.RegistrationStatus;
import com.project.Backend.Team.RequestDTO.CreateTeamRequestDTO;
import com.project.Backend.Team.RequestDTO.AcceptTeamInvitationRequestDTO;
import com.project.Backend.Team.ResponseDTO.TeamResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final CompetitionRepository competitionRepository;
    private final CompetitionRegistrationRepository competitionRegistrationRepository;

    public List<TeamResponseDTO> listTeamsByCompetition(String competitionId) {
        return teamRepository.findByCompetitionId(competitionId)
                .stream()
                .map(TeamMapper::toResponse)
                .toList();
    }

    public List<TeamResponseDTO> listTeamsForUser(String studentId) {
        return teamRepository.findByLeaderIdOrAcceptedMemberIdsContaining(studentId, studentId)
                .stream()
                .map(TeamMapper::toResponse)
                .toList();
    }

    public TeamResponseDTO createTeam(CreateTeamRequestDTO dto, String leaderId) {
        if (dto == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (dto.competitionId() == null || dto.competitionId().isBlank()) {
            throw new IllegalArgumentException("competitionId is required");
        }

        Competition competition = competitionRepository.findById(dto.competitionId())
                .orElseThrow(() -> new IllegalArgumentException("Competition not found"));

        if (!"TEAM".equalsIgnoreCase(competition.getParticipationType())) {
            throw new IllegalStateException("Team registration is not allowed for this competition");
        }

        if (competition.getRegistrationDeadline() != null
                && LocalDateTime.now().isAfter(competition.getRegistrationDeadline())) {
            throw new IllegalStateException("Registration deadline passed");
        }

        if (dto.teamName() == null || dto.teamName().isBlank()) {
            throw new IllegalStateException("Team name is required");
        }

        if (isStudentInAnotherTeamForCompetition(dto.competitionId(), leaderId, null)) {
            throw new IllegalStateException("Student is already in a team for this competition");
        }

        Team team = new Team();
        team.setTeamId("TEAM-" + UUID.randomUUID());
        team.setTeamName(dto.teamName().trim());
        team.setCompetitionId(dto.competitionId());
        team.setLeaderId(leaderId);

        List<String> invited = dto.invitedMemberIds() != null ? dto.invitedMemberIds() : new ArrayList<>();
        team.setInvitedMemberIds(invited);

        List<String> accepted = new ArrayList<>();
        accepted.add(leaderId);
        team.setAcceptedMemberIds(accepted);

        Integer minSize = competition.getMinTeamSize();
        if (minSize == null || accepted.size() >= minSize) {
            team.setStatus(TeamStatus.ACTIVE);
        } else {
            team.setStatus(TeamStatus.PENDING);
        }

        Team saved = teamRepository.save(team);
        ensureTeamRegistrationIfActive(saved);
        return TeamMapper.toResponse(saved);
    }

    public TeamResponseDTO joinTeam(String teamId, String studentId) {
        if (teamId == null || teamId.isBlank()) {
            throw new IllegalArgumentException("teamId is required");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        if (team.getLeaderId().equals(studentId)) {
            return TeamMapper.toResponse(team);
        }

        if (team.getAcceptedMemberIds() == null) {
            team.setAcceptedMemberIds(new ArrayList<>());
        }

        if (team.getAcceptedMemberIds().contains(studentId)) {
            return TeamMapper.toResponse(team);
        }

        Competition competition = competitionRepository
                .findById(team.getCompetitionId())
                .orElseThrow(() -> new IllegalStateException("Competition not found"));

        if (competition.getRegistrationDeadline() != null
                && LocalDateTime.now().isAfter(competition.getRegistrationDeadline())) {
            throw new IllegalStateException("Registration deadline passed");
        }

        if (isStudentInAnotherTeamForCompetition(team.getCompetitionId(), studentId, team.getTeamId())) {
            throw new IllegalStateException("Student is already in another team for this competition");
        }

        int nextAcceptedCount = team.getAcceptedMemberIds().size() + 1;

        if (competition.getMaxTeamSize() != null &&
                nextAcceptedCount > competition.getMaxTeamSize()) {
            throw new IllegalStateException("Team exceeds maximum allowed size");
        }

        team.getAcceptedMemberIds().add(studentId);

        if (competition.getMinTeamSize() != null && nextAcceptedCount >= competition.getMinTeamSize()) {
            team.setStatus(TeamStatus.ACTIVE);
        }

        Team saved = teamRepository.save(team);
        ensureTeamRegistrationIfActive(saved);
        return TeamMapper.toResponse(saved);
    }

    public TeamResponseDTO acceptInvitation(
            AcceptTeamInvitationRequestDTO dto,
            String studentId) {
        if (dto == null || dto.teamId() == null || dto.teamId().isBlank()) {
            throw new IllegalArgumentException("teamId is required");
        }

        Team team = teamRepository.findById(dto.teamId())
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));

        // Leader does not accept
        if (team.getLeaderId().equals(studentId)) {
            throw new IllegalStateException("Leader does not need to accept invitation");
        }

        // Must be invited
        if (!team.getInvitedMemberIds().contains(studentId)) {
            throw new IllegalStateException("Student was not invited");
        }

        if (team.getAcceptedMemberIds() == null) {
            team.setAcceptedMemberIds(new ArrayList<>());
        }

        // Already accepted
        if (team.getAcceptedMemberIds().contains(studentId)) {
            return TeamMapper.toResponse(team);
        }

        // ===== PRE-CHECK SIZE BEFORE MUTATION =====
        Competition competition = competitionRepository
                .findById(team.getCompetitionId())
                .orElseThrow(() -> new IllegalStateException("Competition not found"));

        if (competition.getRegistrationDeadline() != null
                && LocalDateTime.now().isAfter(competition.getRegistrationDeadline())) {
            throw new IllegalStateException("Registration deadline passed");
        }

        if (isStudentInAnotherTeamForCompetition(team.getCompetitionId(), studentId, team.getTeamId())) {
            throw new IllegalStateException("Student is already in another team for this competition");
        }

        int nextAcceptedCount = team.getAcceptedMemberIds().size() + 1;

        if (competition.getMaxTeamSize() != null &&
                nextAcceptedCount > competition.getMaxTeamSize()) {
            throw new IllegalStateException("Team exceeds maximum allowed size");
        }

        // ===== ACCEPT =====
        team.getAcceptedMemberIds().add(studentId);

        // Activate if minimum reached
        if (competition.getMinTeamSize() != null && nextAcceptedCount >= competition.getMinTeamSize()) {
            team.setStatus(TeamStatus.ACTIVE);
        }

        Team saved = teamRepository.save(team);
        ensureTeamRegistrationIfActive(saved);
        return TeamMapper.toResponse(saved);
    }

    private boolean isStudentInAnotherTeamForCompetition(String competitionId, String studentId, String currentTeamId) {
        List<Team> teams = new ArrayList<>(teamRepository.findByCompetitionIdAndLeaderId(competitionId, studentId));
        teams.addAll(teamRepository.findByCompetitionIdAndAcceptedMemberIdsContaining(competitionId, studentId));
        return teams.stream()
                .map(Team::getTeamId)
                .distinct()
                .anyMatch(teamId -> !teamId.equals(currentTeamId));
    }

    private void ensureTeamRegistrationIfActive(Team team) {
        if (team.getStatus() != TeamStatus.ACTIVE) {
            return;
        }

        boolean alreadyRegistered = competitionRegistrationRepository.existsByCompetitionIdAndTeamIdAndStatus(
                team.getCompetitionId(),
                team.getTeamId(),
                RegistrationStatus.REGISTERED);

        if (alreadyRegistered) {
            return;
        }

        CompetitionRegistration registration = CompetitionRegistrationMapper.newTeam(
                team.getCompetitionId(),
                team.getTeamId());
        competitionRegistrationRepository.save(registration);
    }

}
