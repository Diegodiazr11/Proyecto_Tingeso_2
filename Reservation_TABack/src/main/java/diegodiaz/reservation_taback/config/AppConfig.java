package diegodiaz.reservation_taback.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    @Qualifier("internalRestTemplate")
    public RestTemplate internalRestTemplate() {
        return new RestTemplate();
    }
}