package diegodiaz.promotion_taback.controller;

import diegodiaz.promotion_taback.entity.PromotionEntity;
import diegodiaz.promotion_taback.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping("/discount")
    public ResponseEntity<BigDecimal> getDiscount(@RequestParam Long packageId) {
        return ResponseEntity.ok(promotionService.calculateDiscountPromotion(packageId));
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @PostMapping("/create")
    public ResponseEntity<PromotionEntity> createPromotion(@RequestBody PromotionEntity promotion) {
        return ResponseEntity.ok(promotionService.save(promotion));
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @GetMapping("/all")
    public ResponseEntity<List<PromotionEntity>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @PatchMapping("/deactivate/{id}")
    public ResponseEntity<Void> deactivatePromotion(@PathVariable Long id) {
        promotionService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}