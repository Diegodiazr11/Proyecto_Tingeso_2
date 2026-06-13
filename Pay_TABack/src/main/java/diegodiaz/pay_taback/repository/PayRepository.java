package diegodiaz.pay_taback.repository;

import diegodiaz.pay_taback.entity.PayEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayRepository extends JpaRepository<PayEntity, Long> {
}
