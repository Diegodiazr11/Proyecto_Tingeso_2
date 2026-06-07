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


    // ─────────────────────────────────────────────
    // GET ALL
    // ─────────────────────────────────────────────
    public List<ReservationResponseDTO> getAllReservations() {
        // 1. Buscamos las reservaciones de la base de datos local
        List<ReservationEntity> entities = reservationRepository.findAll();

        // 2. EXTRAEMOS EL TOKEN JWT DEL ADMINISTRADOR QUE HIZO LA PETICIÓN
        String token = "";
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            token = jwtAuth.getToken().getTokenValue(); // Aquí capturamos el String del token puro
        }

        // 3. CREAMOS LAS CABECERAS HTTP E INYECTAMOS EL TOKEN COMO BEARER
        HttpHeaders headers = new HttpHeaders();
        if (!token.isEmpty()) {
            headers.setBearerAuth(token); // Esto agrega automáticamente "Authorization: Bearer <token>"
        }
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        return entities.stream().map(entity -> {
            ReservationResponseDTO dto = new ReservationResponseDTO();
            dto.setId(entity.getId());
            dto.setPassengerCount(entity.getPassengerCount());
            dto.setBasePrice(entity.getBasePrice());
            dto.setTotalPrice(entity.getTotalPrice());
            dto.setStatus(entity.getStatus());
            dto.setExpiresAt(entity.getExpiresAt());
            dto.setDiscountAmount(entity.getDiscountAmount());

            // 4. LLAMADA AL PUERTO 8001 USANDO EL TOKEN ENVIADO
            if (entity.getClientKeycloakId() != null) {
                try {
                    String urlCliente = "http://localhost:8001/api/user/search/" + entity.getClientKeycloakId();

                    // IMPORTANTE: Usamos .exchange(...) en vez de .getForObject(...) para poder meter el 'requestEntity' con los headers
                    ResponseEntity<ClientDetailsDTO> response = restTemplate.exchange(
                            urlCliente,
                            HttpMethod.GET,
                            requestEntity, // <-- Aquí viaja el Token del Administrador logueado
                            ClientDetailsDTO.class
                    );

                    dto.setClientKeycloakId(response.getBody());
                } catch (Exception e) {
                    System.out.println("Error al obtener cliente desde el puerto 8001: " + e.getMessage());
                }
            }

            // 5. LLAMADA AL PUERTO 8003 (PAQUETES)
            if (entity.getPackageId() != null) {
                try {
                    String urlPaquetes = "http://localhost:8003/api/package/search/" + entity.getPackageId();
                    // Si el puerto 8003 no pide token (tiene permitAll), puedes dejarlo con getForObject:
                    PackageDetailsDTO pkgDto = restTemplate.getForObject(urlPaquetes, PackageDetailsDTO.class);

                    // Si el 8003 también te empezara a pedir token en el futuro, usas la misma lógica:
                    // ResponseEntity<PackageDetailsDTO> responsePkg = restTemplate.exchange(urlPaquetes, HttpMethod.GET, requestEntity, PackageDetailsDTO.class);
                    // PackageDetailsDTO pkgDto = responsePkg.getBody();

                    dto.setPackageId(pkgDto);
                } catch (Exception e) {
                    System.out.println("Error al obtener paquete desde el puerto 8003: " + e.getMessage());
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // GET BY ID
    // ─────────────────────────────────────────────
    public ReservationEntity getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
    }

    // ─────────────────────────────────────────────
    // GET BY CLIENT KEYCLOAK ID
    // ─────────────────────────────────────────────
    public List<ReservationResponseDTO> getReservationsByClient(String keycloakId) {
        // 1. Buscas las reservaciones del cliente normalmente
        List<ReservationEntity> entities = reservationRepository.findByClientKeycloakId(keycloakId);

        return entities.stream().map(entity -> {
            ReservationResponseDTO dto = new ReservationResponseDTO();
            dto.setId(entity.getId());
            dto.setPassengerCount(entity.getPassengerCount());
            dto.setBasePrice(entity.getBasePrice());
            dto.setTotalPrice(entity.getTotalPrice());
            dto.setStatus(entity.getStatus());
            dto.setExpiresAt(entity.getExpiresAt());
            dto.setDiscountAmount(entity.getDiscountAmount());

            // 2. SOLUCIÓN: Le pedimos al microservicio de paquetes los datos usando el ID
            if (entity.getPackageId() != null) {
                try {
                    // Apuntamos a la ruta exacta que ya tenías: search/{id}
                    String urlPaquetes = "http://localhost:8003/api/package/search/" + entity.getPackageId();

                    // Al retornar una entidad directa, la recibimos directamente como PackageDetailsDTO.class
                    PackageDetailsDTO pkgDto = restTemplate.getForObject(urlPaquetes, PackageDetailsDTO.class);

                    // Se lo asignamos al DTO de respuesta
                    dto.setPackageId(pkgDto);

                } catch (Exception e) {
                    System.out.println("No se pudo obtener el paquete del microservicio: " + e.getMessage());
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────
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

        // Descontar cupos en el microservicio de paquetes
        restTemplate.put("http://localhost:8003/api/package/" + req.getPackageId()
                + "/quotas?delta=" + (-req.getPassengerCount()), null);

        return reservationRepository.save(reservation);
    }

    // ─────────────────────────────────────────────
    // PREVIEW
    // ─────────────────────────────────────────────
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

    // ─────────────────────────────────────────────
    // CONFIRM
    // ─────────────────────────────────────────────
    @Transactional
    public ReservationEntity confirmReservation(Long id) {
        ReservationEntity reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (!reservation.getStatus().equals(ReservationEntity.STATUS_PENDING))
            throw new RuntimeException("Solo se pueden confirmar reservas pendientes");

        reservation.setStatus(ReservationEntity.STATUS_CONFIRMED);
        return reservationRepository.save(reservation);
    }

    // ─────────────────────────────────────────────
    // CANCEL
    // ─────────────────────────────────────────────
    @Transactional
    public ReservationEntity cancelReservation(Long id) {
        ReservationEntity reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_admin_client_role"));

        if (reservation.getStatus().equals(ReservationEntity.STATUS_CONFIRMED) && !isAdmin)
            throw new RuntimeException("No se puede cancelar una reserva ya confirmada");

        // Devolver cupos al microservicio de paquetes
        restTemplate.put("http://localhost:8003/api/package/" + reservation.getPackageId()
                + "/quotas?delta=" + reservation.getPassengerCount(), null);

        reservation.setStatus(ReservationEntity.STATUS_CANCELLED);
        return reservationRepository.save(reservation);
    }

    // ─────────────────────────────────────────────
    // EXPIRE (scheduler cada 1 minuto)
    // ─────────────────────────────────────────────
    @Transactional
    @Scheduled(fixedRate = 60000)
    public void expireReservations() {
        List<ReservationEntity> expired = reservationRepository
                .findByStatusAndExpiresAtBefore(ReservationEntity.STATUS_PENDING, LocalDateTime.now());

        expired.forEach(r -> {
            r.setStatus(ReservationEntity.STATUS_EXPIRED);
            restTemplate.put("http://localhost:8003/api/package/" + r.getPackageId()
                    + "/quotas?delta=" + r.getPassengerCount(), null);
        });

        reservationRepository.saveAll(expired);
    }

    // ─────────────────────────────────────────────
    // Endpoints internos para cuando el front elimina un usuario
    // ─────────────────────────────────────────────
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

    // ─────────────────────────────────────────────
    // Lógica de descuentos
    // ─────────────────────────────────────────────
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

        BigDecimal promotionDiscount = restTemplate.getForObject(
                "http://localhost:8004/api/promotions/discount?packageId=" + packageId,
                BigDecimal.class
        );
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
    }
}