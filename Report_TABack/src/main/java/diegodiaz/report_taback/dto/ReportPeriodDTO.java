package diegodiaz.report_taback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ReportPeriodDTO {
    private Long reservationId;
    private LocalDateTime createdAt;
    private String clientName;
    private String clientEmail;
    private String packageName;
    private String destination;
    private int passengerCount;
    private double totalPrice;
    private double discountAmount;
    private String status;
}
