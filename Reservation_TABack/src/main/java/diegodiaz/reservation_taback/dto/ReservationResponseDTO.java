package diegodiaz.reservation_taback.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservationResponseDTO {
    private Long id;
    private int passengerCount;
    private double basePrice;  // Se mapea de tu precio por persona
    private double totalPrice;
    private String status;     // PENDING, CONFIRMED, etc.
    private LocalDateTime expiresAt;
    private double discountAmount;

    // En lugar de un Long id, aquí enviamos el objeto completo del paquete
    private PackageDetailsDTO packageId;

    private ClientDetailsDTO clientKeycloakId;;
}