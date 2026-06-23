package diegodiaz.reservation_taback.service;

import diegodiaz.reservation_taback.dto.*;
import diegodiaz.reservation_taback.entity.ReservationEntity;
import diegodiaz.reservation_taback.repository.ReservationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.stream.Collectors;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestTemplate restTemplate;

    private HttpEntity<Void> createAuthenticatedRequest() {
        String token = "";
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            token = jwtAuth.getToken().getTokenValue();
        }
        HttpHeaders headers = new HttpHeaders();
        if (!token.isEmpty()) {
            headers.setBearerAuth(token);
        }
        return new HttpEntity<>(headers);
    }

    public List<ReservationResponseDTO> getAllReservations() {
        List<ReservationEntity> entities = reservationRepository.findAll();
        HttpEntity<Void> requestEntity = createAuthenticatedRequest();

        return entities.stream().map(entity -> {
            ReservationResponseDTO dto = new ReservationResponseDTO();
            dto.setId(entity.getId());
            dto.setPassengerCount(entity.getPassengerCount());
            dto.setBasePrice(entity.getBasePrice());
            dto.setTotalPrice(entity.getTotalPrice());
            dto.setStatus(entity.getStatus());
            dto.setExpiresAt(entity.getExpiresAt());
            dto.setCreatedAt(entity.getCreatedAt());
            dto.setDiscountAmount(entity.getDiscountAmount());

            if (entity.getClientKeycloakId() != null) {
                try {
                    String urlCliente = "http://USER-TABACK/api/user/search/" + entity.getClientKeycloakId();
                    ResponseEntity<ClientDetailsDTO> response = restTemplate.exchange(
                            urlCliente, HttpMethod.GET, requestEntity, ClientDetailsDTO.class
                    );
                    dto.setClientKeycloakId(response.getBody());
                } catch (Exception e) {
                    System.out.println("Error al obtener cliente: " + e.getMessage());
                }
            }

            if (entity.getPackageId() != null) {
                try {
                    String urlPaquetes = "http://PACKAGES-TABACK/api/package/search/" + entity.getPackageId();
                    ResponseEntity<PackageDetailsDTO> responsePkg = restTemplate.exchange(
                            urlPaquetes, HttpMethod.GET, requestEntity, PackageDetailsDTO.class
                    );
                    dto.setPackageId(responsePkg.getBody());
                } catch (Exception e) {
                    System.out.println("Error al obtener paquete: " + e.getMessage());
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public ReservationEntity getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
    }

    public List<ReservationResponseDTO> getReservationsByClient(String keycloakId) {
        List<ReservationEntity> entities = reservationRepository.findByClientKeycloakId(keycloakId);
        HttpEntity<Void> requestEntity = createAuthenticatedRequest();

        return entities.stream().map(entity -> {
            ReservationResponseDTO dto = new ReservationResponseDTO();
            dto.setId(entity.getId());
            dto.setPassengerCount(entity.getPassengerCount());
            dto.setBasePrice(entity.getBasePrice());
            dto.setTotalPrice(entity.getTotalPrice());
            dto.setStatus(entity.getStatus());
            dto.setExpiresAt(entity.getExpiresAt());
            dto.setDiscountAmount(entity.getDiscountAmount());

            if (entity.getPackageId() != null) {
                try {
                    String urlPaquetes = "http://PACKAGES-TABACK/api/package/search/" + entity.getPackageId();
                    ResponseEntity<PackageDetailsDTO> responsePkg = restTemplate.exchange(
                            urlPaquetes, HttpMethod.GET, requestEntity, PackageDetailsDTO.class
                    );
                    dto.setPackageId(responsePkg.getBody());
                } catch (Exception e) {
                    System.out.println("No se pudo obtener el paquete del microservicio: " + e.getMessage());
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public ReservationEntity createReservation(CreateReservationRequest req) {
        if (!Boolean.TRUE.equals(req.getClientActive()))
            throw new RuntimeException("Usuario inactivo, no puede reservar");
        if (!Boolean.TRUE.equals(req.getPackageAvailable()))
            throw new RuntimeException("El paquete no está disponible");
        if (req.getAvailableQuotas() <= 0)
            throw new RuntimeException("El paquete no tiene cupos disponibles");
        if (req.getPassengerCount() <= 0)
            throw new RuntimeException("La cantidad de pasajeros debe ser mayor a 0");
        if (req.getPassengerCount() > req.getAvailableQuotas())
            throw new RuntimeException("Cupos insuficientes. Disponibles: " + req.getAvailableQuotas());

        double baseTotal = req.getPricePackage() * req.getPassengerCount();
        DiscountBreakdownDTO breakdown = calculateDiscountWithDetail(
                req.getKeycloakId(), req.getSessionId(),
                req.getPassengerCount(), baseTotal, req.getPackageId()
        );
        double finalPrice = Math.max(0, baseTotal - breakdown.getDiscountAmount());

        ReservationEntity reservation = new ReservationEntity();
        reservation.setClientKeycloakId(req.getKeycloakId());
        reservation.setPackageId(req.getPackageId());
        reservation.setPassengerCount(req.getPassengerCount());
        reservation.setSpecialRequests(req.getSpecialRequests());
        reservation.setSessionId(req.getSessionId());
        reservation.setBasePrice(req.getPricePackage());
        reservation.setDiscountAmount(breakdown.getDiscountAmount());
        reservation.setTotalPrice(finalPrice);
        reservation.setStatus(ReservationEntity.STATUS_PENDING);
        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setExpiresAt(LocalDateTime.now().plusMinutes(720));
        reservation.setDiscountDetail(String.join(", ", breakdown.getAppliedDiscounts()));


        HttpEntity<Void> requestEntity = createAuthenticatedRequest();
        int deltaCupos = req.getPassengerCount() * -1;
        restTemplate.exchange(
                "http://PACKAGES-TABACK/api/package/" + req.getPackageId() + "/quotas?delta=" + deltaCupos,
                HttpMethod.PUT, requestEntity, Void.class
        );

        return reservationRepository.save(reservation);
    }

    public ReservationDTO previewReservation(PreviewReservationRequest req) {
        double baseTotal = req.getPricePackage() * req.getPassengerCount();
        DiscountBreakdownDTO breakdown = calculateDiscountWithDetail(
                req.getKeycloakId(), req.getSessionId(),
                req.getPassengerCount(), baseTotal, req.getPackageId()
        );
        double finalPrice = Math.max(0, baseTotal - breakdown.getDiscountAmount());

        ReservationDTO preview = new ReservationDTO();
        preview.setBaseTotal(baseTotal);
        preview.setDiscountAmount(breakdown.getDiscountAmount());
        preview.setTotalPrice(finalPrice);
        preview.setAppliedDiscounts(breakdown.getAppliedDiscounts());
        return preview;
    }

    @Transactional
    public ReservationEntity confirmReservation(Long id) {
        ReservationEntity reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (!reservation.getStatus().equals(ReservationEntity.STATUS_PENDING))
            throw new RuntimeException("Solo se pueden confirmar reservas pendientes");

        reservation.setStatus(ReservationEntity.STATUS_CONFIRMED);
        return reservationRepository.save(reservation);
    }

    @Transactional
    public ReservationEntity cancelReservation(Long id) {
        ReservationEntity reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_admin_client_role"));

        if (reservation.getStatus().equals(ReservationEntity.STATUS_CONFIRMED) && !isAdmin)
            throw new RuntimeException("No se puede cancelar una reserva ya confirmada");

        HttpEntity<Void> requestEntity = createAuthenticatedRequest();
        restTemplate.exchange(
                "http://PACKAGES-TABACK/api/package/" + reservation.getPackageId() + "/quotas?delta=" + reservation.getPassengerCount(),
                HttpMethod.PUT, requestEntity, Void.class
        );

        reservation.setStatus(ReservationEntity.STATUS_CANCELLED);
        return reservationRepository.save(reservation);
    }

    @Transactional
    @Scheduled(fixedRate = 60000)
    public void expireReservations() {
        List<ReservationEntity> expired = reservationRepository
                .findByStatusAndExpiresAtBefore(ReservationEntity.STATUS_PENDING, LocalDateTime.now());

        expired.forEach(r -> {
            r.setStatus(ReservationEntity.STATUS_EXPIRED);
            int deltaCupos = r.getPassengerCount() * -1;
            try {
                restTemplate.put("http://PACKAGES-TABACK/api/package/" + r.getPackageId() + "/quotas?delta=" + deltaCupos, null);
            } catch (Exception e) {
                System.out.println("Error al devolver cupos en expiración automática: " + e.getMessage());
            }
        });

        reservationRepository.saveAll(expired);
    }

    public boolean hasConfirmedReservations(String keycloakId) {
        return reservationRepository.existsByClientKeycloakIdAndStatus(
                keycloakId, ReservationEntity.STATUS_CONFIRMED);
    }

    @Transactional
    public void cancelPendingReservations(String keycloakId) {
        List<ReservationEntity> pending = reservationRepository
                .findByClientKeycloakIdAndStatus(keycloakId, ReservationEntity.STATUS_PENDING);
        pending.forEach(r -> r.setStatus(ReservationEntity.STATUS_CANCELLED));
        reservationRepository.saveAll(pending);
    }

    @Value("${discount.group.min-passengers}")
    private int groupMinPassengers;
    @Value("${discount.group.percent}")
    private double groupPercent;
    @Value("${discount.frequent.min-reservations}")
    private int frequentMinReservations;
    @Value("${discount.frequent.percent}")
    private double frequentPercent;
    @Value("${discount.multi-package.percent}")
    private double multiPackagePercent;
    @Value("${discount.max-total-percent}")
    private double maxTotalPercent;

    private DiscountBreakdownDTO calculateDiscountWithDetail(String keycloakId, String sessionId,
                                                             int passengerCount, double baseTotal,
                                                             Long packageId) {
        double accumulatedPercent = 0;
        List<String> appliedDiscounts = new ArrayList<>();
        HttpEntity<Void> requestEntity = createAuthenticatedRequest();

        try {
            ResponseEntity<BigDecimal> responsePromo = restTemplate.exchange(
                    "http://PROMOTION-TABACK/api/promotions/discount?packageId=" + packageId,
                    HttpMethod.GET, requestEntity, BigDecimal.class
            );
            BigDecimal promotionDiscount = responsePromo.getBody();
            if (promotionDiscount == null) promotionDiscount = BigDecimal.ZERO;
            double promoValue = promotionDiscount.doubleValue();
            double dynamicMaxPercent = Math.max(maxTotalPercent, promoValue);

            if (promoValue > 0) {
                accumulatedPercent += promoValue;
                appliedDiscounts.add("Promoción activa: " + (int) promoValue + "%");
            }

            if (passengerCount >= groupMinPassengers) {
                accumulatedPercent += groupPercent;
                appliedDiscounts.add("Descuento por grupo: " + (int) groupPercent + "%");
            }

            long paidReservations = reservationRepository
                    .countByClientKeycloakIdAndStatus(keycloakId, ReservationEntity.STATUS_CONFIRMED);
            if (paidReservations >= frequentMinReservations) {
                accumulatedPercent += frequentPercent;
                appliedDiscounts.add("Cliente frecuente: " + (int) frequentPercent + "%");
            }

            if (sessionId != null) {
                long sessionReservations = reservationRepository
                        .countByClientKeycloakIdAndSessionId(keycloakId, sessionId);
                if (sessionReservations == 2) {
                    accumulatedPercent += multiPackagePercent;
                    appliedDiscounts.add("Múltiples paquetes: " + (int) multiPackagePercent + "%");
                }
            }

            double finalTotalPercent = Math.min(accumulatedPercent, dynamicMaxPercent);
            double discountAmount = baseTotal * (finalTotalPercent / 100);

            DiscountBreakdownDTO breakdown = new DiscountBreakdownDTO();
            breakdown.setDiscountAmount(discountAmount);
            breakdown.setTotalDiscountPercent(finalTotalPercent);
            breakdown.setAppliedDiscounts(appliedDiscounts);
            return breakdown;

        } catch (Exception e) {
            System.out.println("Error al calcular descuentos con microservicios externos: " + e.getMessage());
            DiscountBreakdownDTO fallback = new DiscountBreakdownDTO();
            fallback.setDiscountAmount(0);
            fallback.setTotalDiscountPercent(0);
            fallback.setAppliedDiscounts(List.of("Error de conexión con promociones"));
            return fallback;
        }
    }
}