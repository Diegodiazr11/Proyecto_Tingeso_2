package diegodiaz.promotion_taback.service;

import diegodiaz.promotion_taback.entity.PromotionEntity;
import diegodiaz.promotion_taback.repository.PromotionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public BigDecimal calculateDiscountPromotion(Long packageId) {
        if (packageId == null) return BigDecimal.ZERO;

        List<PromotionEntity> promotions = promotionRepository
                .findPromotionCurrent(LocalDateTime.now(), packageId);

        return promotions.stream()
                .map(PromotionEntity::getPercentageDiscount)
                .filter(discount -> discount != null && discount.compareTo(BigDecimal.ZERO) > 0)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    public PromotionEntity save(PromotionEntity promotion) {
        return promotionRepository.save(promotion);
    }

    public List<PromotionEntity> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public void deactivate(Long id) {
        PromotionEntity promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoción no encontrada"));
        promotion.setActive(false);
        promotionRepository.save(promotion);
    }

    @Modifying
    @Transactional
    @Scheduled(fixedRate = 3600000)
    public void deactivateExpiredPromotions() {
        int updated = promotionRepository.deactivateExpired(LocalDateTime.now());
        if (updated > 0) {
            log.info("Se desactivaron {} promociones vencidas", updated);
        }
    }
}