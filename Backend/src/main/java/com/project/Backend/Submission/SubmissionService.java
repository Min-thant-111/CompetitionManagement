package com.project.Backend.Submission;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.project.Backend.Competition.Competition;
import com.project.Backend.Competition.CompetitionRepository;
import com.project.Backend.CompetitionRegistration.CompetitionRegistrationRepository;
import com.project.Backend.CompetitionRegistration.RegistrationStatus;
import com.project.Backend.Submission.RequestDTO.AssignmentSubmissionRequestDTO;
import com.project.Backend.Submission.RequestDTO.ProjectSubmissionRequestDTO;
import com.project.Backend.Submission.RequestDTO.QuizSubmissionRequestDTO;
import com.project.Backend.Submission.ResponseDTO.SubmissionCoreDTO;
import com.project.Backend.Team.TeamContext;
import com.project.Backend.Team.TeamRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmissionService {

        private final SubmissionRepository submissionRepository;
        private final CompetitionRepository competitionRepository;
        private final CompetitionRegistrationRepository competitionRegistrationRepository;
        private final TeamRepository teamRepository;

        // ================= VIEW =================

        public List<SubmissionCoreDTO> getTeacherSubmissions(String teacherId) {
                List<Competition> ownedCompetitions = competitionRepository.findAll()
                                .stream()
                                .filter(c -> teacherId != null && teacherId.equals(c.getCreatedBy()))
                                .toList();

                List<String> competitionIds = ownedCompetitions
                                .stream()
                                .map(Competition::getCompetitionId)
                                .toList();

                if (competitionIds.isEmpty()) {
                        return List.of();
                }

                Map<String, Competition> competitionMap = ownedCompetitions
                                .stream()
                                .collect(Collectors.toMap(Competition::getCompetitionId, c -> c));

                return submissionRepository.findByCompetitionIdIn(competitionIds)
                                .stream()
                                .map(s -> SubmissionMapper.toResponse(s, competitionMap.get(s.getCompetitionId())))
                                .toList();
        }

        public List<SubmissionCoreDTO> getTeacherSubmissionsByCompetition(
                        String competitionId,
                        String teacherId) {
                Competition competition = competitionRepository.findById(competitionId)
                                .orElseThrow(() -> new IllegalArgumentException("Competition not found"));

                if (!"INTERNAL".equalsIgnoreCase(competition.getCompetitionType())) {
                        throw new IllegalStateException("Only internal competitions are supported for teacher submissions");
                }

                if (teacherId == null || !teacherId.equals(competition.getCreatedBy())) {
                        throw new IllegalStateException("Teacher can only view submissions for competitions they created");
                }

                return submissionRepository.findByCompetitionId(competitionId)
                                .stream()
                                .map(s -> SubmissionMapper.toResponse(s, competition))
                                .toList();
        }

        public List<SubmissionCoreDTO> getMySubmissions(String studentId) {

                List<Submission> individual = submissionRepository.findBySubmittedBy(studentId);

                List<String> teamIds = teamRepository
                                .findByLeaderIdOrAcceptedMemberIdsContaining(studentId, studentId)
                                .stream()
                                .map(t -> t.getTeamId())
                                .toList();

                List<String> registeredTeamIds = competitionRegistrationRepository
                                .findByTeamIdInAndStatus(teamIds, RegistrationStatus.REGISTERED)
                                .stream()
                                .map(r -> r.getTeamId())
                                .toList();

                List<Submission> teamSubmissions = registeredTeamIds.isEmpty()
                                ? List.of()
                                : submissionRepository.findByTeamIdIn(registeredTeamIds);

                List<Submission> all = new ArrayList<>();
                all.addAll(individual);
                all.addAll(teamSubmissions);

                return mapWithCompetitions(all);
        }

        public List<SubmissionCoreDTO> getMySubmissionsByCompetition(
                        String competitionId,
                        String studentId) {

                List<Submission> individual = submissionRepository
                                .findByCompetitionIdAndSubmittedBy(competitionId, studentId)
                                .map(List::of)
                                .orElse(List.of());

                var teams = new ArrayList<>(teamRepository
                                .findByCompetitionIdAndLeaderId(competitionId, studentId));
                teams.addAll(teamRepository
                                .findByCompetitionIdAndAcceptedMemberIdsContaining(competitionId, studentId));

                List<String> teamIds = teams.stream()
                                .map(t -> t.getTeamId())
                                .distinct()
                                .toList();

                List<String> registeredTeamIds = competitionRegistrationRepository
                                .findByCompetitionIdAndTeamIdInAndStatus(
                                                competitionId,
                                                teamIds,
                                                RegistrationStatus.REGISTERED)
                                .stream()
                                .map(r -> r.getTeamId())
                                .toList();

                List<Submission> teamSubmissions = registeredTeamIds.isEmpty()
                                ? List.of()
                                : submissionRepository.findByTeamIdIn(registeredTeamIds);

                List<Submission> all = new ArrayList<>();
                all.addAll(individual);
                all.addAll(teamSubmissions);

                Competition competition = competitionRepository.findById(competitionId)
                                .orElseThrow(() -> new IllegalArgumentException("Competition not found"));

                return all.stream()
                                .map(s -> SubmissionMapper.toResponse(s, competition))
                                .toList();
        }

        public SubmissionCoreDTO getMySubmissionById(String studentId, String submissionId) {

                Submission submission = submissionRepository
                                .findBySubmissionId(submissionId)
                                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));

                if (submission.getTeamId() != null) {
                        boolean isLeader = teamRepository
                                        .existsByTeamIdAndLeaderId(submission.getTeamId(), studentId);
                        boolean isMember = teamRepository
                                        .existsByTeamIdAndAcceptedMemberIdsContaining(
                                                        submission.getTeamId(), studentId);
                        if (!isLeader && !isMember) {
                                throw new IllegalStateException("Not authorized");
                        }
                } else {
                        if (!submission.getSubmittedBy().equals(studentId)) {
                                throw new IllegalStateException("Not authorized");
                        }
                }

                Competition competition = competitionRepository.findById(submission.getCompetitionId())
                                .orElseThrow(() -> new IllegalArgumentException("Competition not found"));

                return SubmissionMapper.toResponse(submission, competition);
        }

        // ================= ASSIGNMENT =================

        public SubmissionCoreDTO submitOrUpdateAssignment(
                        String competitionId,
                        AssignmentSubmissionRequestDTO dto,
                        String studentId) {
                if (dto == null) {
                        throw new IllegalArgumentException("Request body is required");
                }

                Competition competition = validateAndGetCompetition(competitionId, "ASSIGNMENT");
                TeamContext ctx = resolveTeamContext(competition, studentId);
                assertRegistered(competition, ctx);

                if (dto.file() == null || dto.file().isBlank()) {
                        throw new IllegalArgumentException("Assignment file is required");
                }

                Submission submission = submissionRepository
                                .findByCompetitionIdAndSubmittedBy(competitionId, ctx.submittedBy())
                                .orElseGet(() -> SubmissionMapper.newAssignment(
                                                competitionId, ctx.submittedBy(), ctx, dto));

                SubmissionMapper.applyAssignmentUpdate(submission, dto, ctx);

                return SubmissionMapper.toResponse(
                                submissionRepository.save(submission),
                                competition);
        }

        // ================= PROJECT =================

        public SubmissionCoreDTO submitOrUpdateProject(
                        String competitionId,
                        ProjectSubmissionRequestDTO dto,
                        String studentId) {
                if (dto == null) {
                        throw new IllegalArgumentException("Request body is required");
                }

                Competition competition = validateAndGetCompetition(competitionId, "PROJECT");
                TeamContext ctx = resolveTeamContext(competition, studentId);
                assertRegistered(competition, ctx);

                if (dto.repoLink() == null || dto.repoLink().isBlank()) {
                        throw new IllegalArgumentException("Repository link is required");
                }

                Submission submission = submissionRepository
                                .findByCompetitionIdAndSubmittedBy(competitionId, ctx.submittedBy())
                                .orElseGet(() -> SubmissionMapper.newProject(
                                                competitionId, ctx.submittedBy(), ctx, dto));

                SubmissionMapper.applyProjectUpdate(submission, dto, ctx);

                return SubmissionMapper.toResponse(
                                submissionRepository.save(submission),
                                competition);
        }

        // ================= QUIZ =================

        public SubmissionCoreDTO submitQuiz(
                        String competitionId,
                        QuizSubmissionRequestDTO dto,
                        String studentId) {
                if (dto == null) {
                        throw new IllegalArgumentException("Request body is required");
                }

                Competition competition = validateAndGetCompetition(competitionId, "QUIZ");
                TeamContext ctx = resolveTeamContext(competition, studentId);
                assertRegistered(competition, ctx);

                if (submissionRepository.existsByCompetitionIdAndSubmittedBy(
                                competitionId, ctx.submittedBy())) {
                        throw new IllegalStateException("Quiz can only be submitted once");
                }

                Submission submission = SubmissionMapper.newQuiz(competitionId, ctx.submittedBy(), ctx, dto);

                return SubmissionMapper.toResponse(
                                submissionRepository.save(submission),
                                competition);
        }

        // ================= HELPERS =================

        private Competition validateAndGetCompetition(
                        String competitionId,
                        String expectedType) {

                Competition competition = competitionRepository.findById(competitionId)
                                .orElseThrow(() -> new IllegalArgumentException("Competition not found"));

                LocalDateTime now = LocalDateTime.now();

                if (competition.getRegistrationDeadline() != null
                                && now.isBefore(competition.getRegistrationDeadline())) {
                        throw new IllegalStateException("Submission not open yet");
                }

                if (competition.getSubmissionDeadline() != null
                                && now.isAfter(competition.getSubmissionDeadline())) {
                        throw new IllegalStateException("Submission deadline passed");
                }

                String format = competition.getFormat();
                if (format == null || !format.equalsIgnoreCase(expectedType)) {
                        throw new IllegalStateException("Invalid submission type");
                }

                return competition;
        }

        private TeamContext resolveTeamContext(Competition competition, String studentId) {

                String participationType = competition.getParticipationType();
                if (participationType == null || participationType.isBlank()) {
                        throw new IllegalStateException("Competition participation type is not configured");
                }

                if ("INDIVIDUAL".equalsIgnoreCase(participationType)) {
                        return TeamContext.individual(studentId);
                }

                if (!"TEAM".equalsIgnoreCase(participationType)) {
                        throw new IllegalStateException("Unsupported participation type");
                }

                var teams = teamRepository
                                .findByCompetitionIdAndLeaderId(
                                                competition.getCompetitionId(), studentId);

                if (teams.isEmpty()) {
                        throw new IllegalStateException("Student is not a team leader for this competition");
                }

                String teamId = teams.get(0).getTeamId();
                boolean registered = competitionRegistrationRepository
                                .existsByCompetitionIdAndTeamIdAndStatus(
                                                competition.getCompetitionId(),
                                                teamId,
                                                RegistrationStatus.REGISTERED);

                if (!registered) {
                        throw new IllegalStateException("Team not registered");
                }

                return TeamContext.team(teamId, studentId);
        }

        private void assertRegistered(Competition competition, TeamContext ctx) {

                if ("INDIVIDUAL".equalsIgnoreCase(competition.getParticipationType())) {

                        boolean registered = competitionRegistrationRepository
                                        .existsByCompetitionIdAndStudentIdAndStatus(
                                                        competition.getCompetitionId(),
                                                        ctx.submittedBy(),
                                                        RegistrationStatus.REGISTERED);

                        if (!registered) {
                                throw new IllegalStateException("Student is not registered");
                        }
                        return;
                }

                boolean teamRegistered = competitionRegistrationRepository
                                .existsByCompetitionIdAndTeamIdAndStatus(
                                                competition.getCompetitionId(),
                                                ctx.teamId(),
                                                RegistrationStatus.REGISTERED);

                if (!teamRegistered) {
                        throw new IllegalStateException("Team is not registered");
                }
        }

        private List<SubmissionCoreDTO> mapWithCompetitions(List<Submission> submissions) {

                if (submissions.isEmpty())
                        return List.of();

                // Batch load competitions to avoid N+1
                var competitionMap = competitionRepository
                                .findAllById(
                                                submissions.stream()
                                                                .map(Submission::getCompetitionId)
                                                                .distinct()
                                                                .toList())
                                .stream()
                                .collect(Collectors.toMap(
                                                Competition::getCompetitionId,
                                                c -> c));

                return submissions.stream()
                                .map(s -> SubmissionMapper.toResponse(
                                                s,
                                                competitionMap.get(s.getCompetitionId())))
                                .toList();
        }
}
