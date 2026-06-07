package diegodiaz.reservation_taback.dto;

import lombok.Data;

@Data
public class CreateReservationRequest {
    private String keycloakId;
    private Long packageId;
    private int passengerCount;
    private String specialRequests;
    private String sessionId;

    private double pricePackage;
    private Boolean clientActive;
    private Boolean packageAvailable;
    private int availableQuotas;
}
