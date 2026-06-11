package diegodiaz.promotion_taback.repository;

import diegodiaz.promotion_taback.entity.PromotionEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<PromotionEntity, Long> {

    @Query("""
    SELECT p FROM PromotionEntity p
    WHERE p.active = true
    AND p.startDate <= :now
    AND p.endDate >= :now
    AND (p.packageId IS NULL OR p.packageId = :packageId)
    """)
    List<PromotionEntity> findPromotionCurrent(
            @Param("now") LocalDateTime now,
            @Param("packageId") Long packageId
    );

    @Modifying
    @Transactional
    @Query("UPDATE PromotionEntity p SET p.active = false WHERE p.active = true AND p.endDate < :now")
    int deactivateExpired(@Param("now") LocalDateTime now);
}