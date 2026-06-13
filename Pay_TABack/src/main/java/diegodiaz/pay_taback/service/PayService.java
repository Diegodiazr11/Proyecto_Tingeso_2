package diegodiaz.pay_taback.service;

import diegodiaz.pay_taback.dto.PayDTO;
import diegodiaz.pay_taback.entity.PayEntity;
import diegodiaz.pay_taback.repository.PayRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
        restTemplate.exchange(
                "http://localhost:8002/api/reservations/" + dto.getReservationId() + "/confirm",
                org.springframework.http.HttpMethod.PATCH,
                null,
                Void.class
        );

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
