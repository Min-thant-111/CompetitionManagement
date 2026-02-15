package com.project.Backend.CompetitionRegistration;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CompetitionRegistrationRepository
                extends MongoRepository<CompetitionRegistration, String> {

        boolean existsByCompetitionIdAndStudentId(
                        String competitionId,
                        String studentId);

        boolean existsByCompetitionIdAndTeamId(
                        String competitionId,
                        String teamId);

        List<CompetitionRegistration> findByCompetitionId(String competitionId);

        List<CompetitionRegistration> findByTeamId(String teamId);

        List<CompetitionRegistration> findByTeamIdIn(List<String> teamIds);

        List<CompetitionRegistration> findByTeamIdInAndStatus(
                        List<String> teamIds,
                        RegistrationStatus status);

        List<CompetitionRegistration> findByCompetitionIdAndTeamIdInAndStatus(
                        String competitionId,
                        List<String> teamIds,
                        RegistrationStatus status);

        List<CompetitionRegistration> findByStudentIdAndStatus(
                        String studentId,
                        RegistrationStatus status);

        boolean existsByCompetitionIdAndTeamIdAndStatus(
                        String competitionId,
                        String teamId,
                        RegistrationStatus status);

        boolean existsByCompetitionIdAndStudentIdAndStatus(
                        String competitionId,
                        String studentId,
                        RegistrationStatus status);
}
