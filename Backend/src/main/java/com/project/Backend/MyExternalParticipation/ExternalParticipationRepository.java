package com.project.Backend.MyExternalParticipation;

import com.project.Backend.MyExternalParticipation.ExternalParticipation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ExternalParticipationRepository extends MongoRepository<ExternalParticipation, String> {
    List<ExternalParticipation> findByOwnerIdOrderBySubmittedAtDesc(String ownerId);
    List<ExternalParticipation> findByStatusOrderBySubmittedAtDesc(String status);
    List<ExternalParticipation> findByStatusAndSourceOrderBySubmittedAtDesc(String status, String source);
}
