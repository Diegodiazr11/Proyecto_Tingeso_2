package diegodiaz.reservation_taback.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;


@Entity
@Data
@Table(name = "reservations")
public class ReservationEntity {

    public static final String STATUS_PENDING   = "PENDING";
    public static final String STATUS_CONFIRMED = "CONFIRMED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_EXPIRED   = "EXPIRED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_keycloak_id", nullable = false)
    private String clientKeycloakId;

    @Column(name = "package_id", nullable = false)
    private Long packageId;

    @Column(name = "passenger_count", nullable = false)
    private int passengerCount;

    @Column(name = "special_requests", length = 500)
    private String specialRequests;

    @Column(name = "base_price", nullable = false)
    private double basePrice;

    @Column(name = "total_price", nullable = false)
    private double totalPrice;

    @Column(name = "discount_amount", nullable = false)
    private double discountAmount = 0;

    @Column(name = "status", nullable = false, length = 20)
    private String status = STATUS_PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "session_id")
    private String sessionId;

    @Column(columnDefinition = "TEXT")
    private String discountDetail;
}
