package diegodiaz.report_taback.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReportRankingDTO {
    private Long packageId;
    private String packageName;
    private String destination;
    private long totalReservations;
    private long totalPassengers;
    private double totalRevenue;
}