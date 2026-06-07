package diegodiaz.reservation_taback.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PackageDetailsDTO {
    private Long id;
    private String namePackage;
    private String destinationPackage;
    private String classificationPackage;
    private String descriptionPackage;
    private String servicePackage;
    private String conditionPackage;
    private String restrictionPackage;
    private LocalDate startDate;
    private LocalDate endDate;
    private double pricePackage;
}