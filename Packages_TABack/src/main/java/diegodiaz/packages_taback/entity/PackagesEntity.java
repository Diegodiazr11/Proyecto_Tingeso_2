package diegodiaz.packages_taback.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "Packages")
public class PackagesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "namePackage" , length = 100 , nullable = false)
    private String namePackage;

    @Column(name = "destinationPackage", length = 50, nullable = false)
    private String destinationPackage;

    @Column(name = "descriptionPackage", nullable = false)
    private String descriptionPackage;

    @Column(name = "startDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "endDate", nullable = false)
    private LocalDate endDate;

    @Column(name = "durationPackage", nullable = false)
    private double durationPackage;

    @Column(name = "pricePackage", nullable = false)
    private double pricePackage;

    @Column(name = "servicePackage", nullable = false)
    private String servicePackage;

    @Column(name = "conditionPackage", nullable = false)
    private String conditionPackage;

    @Column(name = "restrictionPackage", nullable = false)
    private String restrictionPackage;

    @Column(name = "classificationPackage", nullable = false)
    private String classificationPackage;

    @Column(name = "availableQuotas", nullable = false)
    private int availableQuotas;

    @Column(name = "status", nullable = false)
    private boolean status = true;

}