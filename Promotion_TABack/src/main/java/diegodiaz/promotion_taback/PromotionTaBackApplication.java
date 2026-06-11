package diegodiaz.promotion_taback;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PromotionTaBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(PromotionTaBackApplication.class, args);
    }

}
