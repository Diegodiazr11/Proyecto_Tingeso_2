package diegodiaz.reservation_taback.dto;

import lombok.Data;

@Data
public class ClientDetailsDTO {
    private String keycloakId;
    private String firstName;
    private String lastName;
    private String email;
    private String document;
    private String phone;
    private String nationality;
}