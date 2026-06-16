package diegodiaz.report_taback.service;

import diegodiaz.report_taback.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final RestTemplate restTemplate;

    private HttpEntity<Void> buildRequestEntity() {
        String token = "";
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            token = jwtAuth.getToken().getTokenValue();
        }
        HttpHeaders headers = new HttpHeaders();
        if (!token.isEmpty()) headers.setBearerAuth(token);
        return new HttpEntity<>(headers);
    }

    private List<ReservationResponseDTO> getAllReservations() {
        try {
            HttpEntity<Void> requestEntity = buildRequestEntity();
            ResponseEntity<List<ReservationResponseDTO>> response = restTemplate.exchange(
                    "http://RESERVATION-TABACK/api/reservations/all",
                    HttpMethod.GET,
                    requestEntity,
                    new ParameterizedTypeReference<List<ReservationResponseDTO>>() {}
            );
            return response.getBody() != null ? response.getBody() : new ArrayList<>();
        } catch (Exception e) {
            System.out.println("Error al obtener reservas en ReportService: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<ReportPeriodDTO> getPeriodReport(ReportRequestDTO request) {
        List<ReservationResponseDTO> reservations = getAllReservations();

        return reservations.stream()
                .filter(r -> r.getStatus() != null
                        && !r.getStatus().equals("CANCELLED")
                        && !r.getStatus().equals("EXPIRED")
                        && !r.getStatus().equals("PENDING"))

                .filter(r -> r.getCreatedAt() != null)
                .filter(r -> {
                    LocalDate createdDate = r.getCreatedAt().toLocalDate();
                    return !createdDate.isBefore(request.getStartDate())
                            && !createdDate.isAfter(request.getEndDate());
                })

                .sorted(Comparator.comparing(ReservationResponseDTO::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(r -> new ReportPeriodDTO(
                        r.getId(),
                        r.getCreatedAt(),
                        r.getClientKeycloakId() != null
                                ? r.getClientKeycloakId().getFirstName() + " " + r.getClientKeycloakId().getLastName()
                                : "—",
                        r.getClientKeycloakId() != null ? r.getClientKeycloakId().getEmail() : "—",
                        r.getPackageId() != null ? r.getPackageId().getNamePackage() : "—",
                        r.getPackageId() != null ? r.getPackageId().getDestinationPackage() : "—",
                        r.getPassengerCount(),
                        r.getTotalPrice(),
                        r.getDiscountAmount(),
                        r.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public List<ReportRankingDTO> getRankingRanking(ReportRequestDTO request) {
        List<ReservationResponseDTO> reservations = getAllReservations();

        return reservations.stream()
                .filter(r -> "CONFIRMED".equals(r.getStatus()))
                // Escudo protector para fechas en el ranking también
                .filter(r -> r.getCreatedAt() != null)
                .filter(r -> {
                    LocalDate createdDate = r.getCreatedAt().toLocalDate();
                    return !createdDate.isBefore(request.getStartDate())
                            && !createdDate.isAfter(request.getEndDate());
                })
                .filter(r -> r.getPackageId() != null)
                .collect(Collectors.groupingBy(r -> r.getPackageId().getId()))
                .entrySet().stream()
                .map(entry -> {
                    List<ReservationResponseDTO> group = entry.getValue();
                    ReservationResponseDTO first = group.get(0);
                    return new ReportRankingDTO(
                            first.getPackageId().getId(),
                            first.getPackageId().getNamePackage(),
                            first.getPackageId().getDestinationPackage(),
                            group.size(),
                            group.stream().mapToLong(ReservationResponseDTO::getPassengerCount).sum(),
                            group.stream().mapToDouble(ReservationResponseDTO::getTotalPrice).sum()
                    );
                })
                .sorted(Comparator.comparingLong(ReportRankingDTO::getTotalReservations).reversed())
                .collect(Collectors.toList());
    }
}
