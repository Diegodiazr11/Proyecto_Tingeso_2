package diegodiaz.user_taback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private String document;
    private String phone;
    private String nationality;
    private Set<String> roles;
}