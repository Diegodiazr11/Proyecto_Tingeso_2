package diegodiaz.report_taback.dto;

import lombok.Data;

@Data
public class PackageDetailsDTO {
    private Long id;
    private String namePackage;
    private String destinationPackage;
    private String descriptionPackage;
    private String servicePackage;
    private String conditionPackage;
    private String restrictionPackage;
    private String classificationPackage;
    private double pricePackage;
    private double durationPackage;
    private String startDate;
    private String endDate;
    private int availableQuotas;
    private boolean status;
}
