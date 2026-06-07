package diegodiaz.reservation_taback.repository;

import diegodiaz.reservation_taback.entity.ReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationEntity, Long> {

    long countByClientKeycloakIdAndStatus(String keycloakId, String status);
    long countByClientKeycloakIdAndSessionId(String keycloakId, String sessionId);
    List<ReservationEntity> findByClientKeycloakId(String keycloakId);
    List<ReservationEntity> findByClientKeycloakIdAndStatus(String keycloakId, String status);
    List<ReservationEntity> findByStatusAndExpiresAtBefore(String status, LocalDateTime dateTime);
    boolean existsByClientKeycloakIdAndStatus(String keycloakId, String status);
}
