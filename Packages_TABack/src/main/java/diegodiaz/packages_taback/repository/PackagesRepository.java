package diegodiaz.packages_taback.repository;

import diegodiaz.packages_taback.entity.PackagesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface PackagesRepository extends JpaRepository<PackagesEntity, Long> {

    @Query("""
    SELECT p FROM PackagesEntity p
    WHERE p.status = true
      AND p.availableQuotas > 0
      AND p.endDate >= :today
      AND (
          :search IS NULL
          OR LOWER(p.destinationPackage) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
          OR LOWER(p.namePackage)        LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
      )
      AND (:classification IS NULL OR p.classificationPackage = CAST(:classification AS string))
      AND (:minPrice IS NULL OR p.pricePackage >= :minPrice)
      AND (:maxPrice IS NULL OR p.pricePackage <= :maxPrice)
      AND (:startDate IS NULL OR p.startDate >= :startDate)
      AND (:endDate   IS NULL OR p.endDate   <= :endDate)
      AND (:minDuration IS NULL OR p.durationPackage >= :minDuration)
      AND (:maxDuration IS NULL OR p.durationPackage <= :maxDuration)
    ORDER BY
      CASE WHEN :sortBy = 'price_asc'  THEN p.pricePackage END ASC,
      CASE WHEN :sortBy = 'price_desc' THEN p.pricePackage END DESC,
      CASE WHEN :sortBy = 'date_asc'   THEN p.startDate    END ASC,
      p.id ASC
""")
    List<PackagesEntity> searchPackages(
            @Param("today")          LocalDate today,
            @Param("search")         String search,
            @Param("classification") String classification,
            @Param("minPrice")       Double minPrice,
            @Param("maxPrice")       Double maxPrice,
            @Param("startDate")      LocalDate startDate,
            @Param("endDate")        LocalDate endDate,
            @Param("minDuration")    Double minDuration,
            @Param("maxDuration")    Double maxDuration,
            @Param("sortBy")         String sortBy
    );
}
