package diegodiaz.pay_taback.controller;

import diegodiaz.pay_taback.dto.PayDTO;
import diegodiaz.pay_taback.entity.PayEntity;
import diegodiaz.pay_taback.service.PayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pay")
@RequiredArgsConstructor
public class PayController {

    private final PayService payService;

    @PreAuthorize("hasRole('admin_client_role')")
    @GetMapping("/all")
    public ResponseEntity<List<PayEntity>> findAll() {
        List<PayEntity> pay =  payService.getAllpayments();
        return ResponseEntity.ok(pay);
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @GetMapping("search/{payId}")
    public ResponseEntity<PayEntity> findByPayId(@PathVariable Long payId) {
        PayEntity pay = payService.getpaybyId(payId);
        return ResponseEntity.ok(pay);
    }

    @PreAuthorize("hasRole('user_client_role')")
    @PostMapping("/create")
    public ResponseEntity<PayEntity> createPay(@RequestBody PayDTO dto) {
        return ResponseEntity.ok(payService.createPay(dto));
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @PutMapping("/update")
    public ResponseEntity<PayEntity> updatepay(@RequestBody PayEntity pay) {
        PayEntity payEntity = payService.updatePay(pay);
        return ResponseEntity.ok(payEntity);
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @DeleteMapping("delete/{payId}")
    public ResponseEntity<?> deletePay(@PathVariable Long payId) {
        payService.deletePay(payId);
        return ResponseEntity.noContent().build();
    }
}

