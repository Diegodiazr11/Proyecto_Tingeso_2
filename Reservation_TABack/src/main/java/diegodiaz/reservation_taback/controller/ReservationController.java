package diegodiaz.reservation_taback.controller;

import diegodiaz.reservation_taback.dto.CreateReservationRequest;
import diegodiaz.reservation_taback.dto.PreviewReservationRequest;
import diegodiaz.reservation_taback.dto.ReservationDTO;
import diegodiaz.reservation_taback.dto.ReservationResponseDTO;
import diegodiaz.reservation_taback.entity.ReservationEntity;
import diegodiaz.reservation_taback.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.ws.rs.PUT;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PreAuthorize("hasRole('admin_client_role')")
    @GetMapping("/all")
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {
        List<ReservationResponseDTO> dtos = reservationService.getAllReservations();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationEntity> getReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @GetMapping("/client/{keycloakId}")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsByClient(@PathVariable String keycloakId) {
        List<ReservationResponseDTO> dtos = reservationService.getReservationsByClient(keycloakId);
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/create")
    public ResponseEntity<ReservationEntity> createReservation(@RequestBody CreateReservationRequest req) {
        return ResponseEntity.ok(reservationService.createReservation(req));
    }

    @PostMapping("/preview")
    public ResponseEntity<ReservationDTO> previewReservation(@RequestBody PreviewReservationRequest req) {
        return ResponseEntity.ok(reservationService.previewReservation(req));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ReservationEntity> confirmReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.confirmReservation(id));
    }

    @PatchMapping("/cancel/{id}")
    public ResponseEntity<ReservationEntity> cancelReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.cancelReservation(id));
    }


    @GetMapping("/confirmed/exists")
    public ResponseEntity<Boolean> hasConfirmedReservations(@RequestParam String userId) {
        return ResponseEntity.ok(reservationService.hasConfirmedReservations(userId));
    }

    @PostMapping("/pending/cancel")
    public ResponseEntity<Void> cancelPendingReservations(@RequestParam String userId) {
        reservationService.cancelPendingReservations(userId);
        return ResponseEntity.ok().build();
    }
}
