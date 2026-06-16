package diegodiaz.report_taback.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservationResponseDTO {
    private Long id;
    private int passengerCount;
    private double basePrice;
    private double totalPrice;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private double discountAmount;
    private PackageDetailsDTO packageId;
    private ClientDetailsDTO clientKeycloakId;
}