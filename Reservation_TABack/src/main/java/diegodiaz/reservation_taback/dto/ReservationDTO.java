package diegodiaz.reservation_taback.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReservationDTO {
    private double baseTotal;
    private double discountAmount;
    private double totalPrice;
    private List<String> appliedDiscounts;
}