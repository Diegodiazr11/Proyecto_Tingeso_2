package diegodiaz.reservation_taback.dto;

import lombok.Data;
import java.util.List;

@Data
public class DiscountBreakdownDTO {
    private double discountAmount;
    private double totalDiscountPercent;
    private List<String> appliedDiscounts;
}