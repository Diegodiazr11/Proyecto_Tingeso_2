package diegodiaz.pay_taback.service;

import diegodiaz.pay_taback.dto.PayDTO;
import diegodiaz.pay_taback.entity.PayEntity;
import diegodiaz.pay_taback.repository.PayRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PayService {

    private final PayRepository payRepository;
    private final RestTemplate restTemplate;

    public List<PayEntity> getAllpayments() {
        return payRepository.findAll();
    }

    public PayEntity getpaybyId(Long payId)  {
        return payRepository.findById(payId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrada"));

    }

    public PayEntity createPay(PayDTO dto) {

        String token = "";
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            token = jwtAuth.getToken().getTokenValue();
        }

        HttpHeaders headers = new HttpHeaders();
        if (!token.isEmpty()) {
            headers.setBearerAuth(token);
        }
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(
                    "http://RESERVATION-TABACK/api/reservations/" + dto.getReservationId() + "/confirm",
                    HttpMethod.PUT,
                    requestEntity,
                    Void.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Error al confirmar la reserva en RESERVATION-TABACK: " + e.getMessage());
        }

        PayEntity pay = new PayEntity();
        pay.setReservationId(dto.getReservationId());
        pay.setPrice(dto.getPrice());
        pay.setFormat(dto.getFormat());
        pay.setDate(dto.getDate());

        return payRepository.save(pay);
    }

    public PayEntity updatePay (PayEntity pay) {
        return payRepository.save(pay);
    }

    public void deletePay(Long payId) {
        if (!payRepository.existsById(payId)) {
            throw new EntityNotFoundException("Pago no encontrado con id: " + payId);
        }
        payRepository.deleteById(payId);
    }
}
