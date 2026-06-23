package diegodiaz.reservation_taback.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservationResponseDTO {
    private Long id;
    private int passengerCount;
    private double basePrice;
    private double totalPrice;
    private LocalDateTime createdAt;
    private String status;
    private LocalDateTime expiresAt;
    private double discountAmount;

    private PackageDetailsDTO packageId;

    private ClientDetailsDTO clientKeycloakId;;
}