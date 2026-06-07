package diegodiaz.reservation_taback.dto;

import lombok.Data;

@Data
public class PreviewReservationRequest {
    private String keycloakId;
    private Long packageId;
    private int passengerCount;
    private String sessionId;

    // El front lo obtiene del microservicio de paquetes
    private double pricePackage;
}