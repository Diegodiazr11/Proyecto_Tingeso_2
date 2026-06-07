package diegodiaz.reservation_taback;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ReservationTaBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReservationTaBackApplication.class, args);
    }

}
