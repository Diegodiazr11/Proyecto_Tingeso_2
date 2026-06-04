package diegodiaz.user_taback.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "keycloak_id", length = 36, unique = true)
    private String keycloakId;

    @Column(name = "document", length = 20, unique = true)
    private String document;

    @Column(name = "first_name", length = 50, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 50, nullable = false)
    private String lastName;

    @Column(name = "username", length = 50, nullable = false, unique = true)
    private String username;

    @Column(name = "email", length = 80, nullable = false, unique = true)
    private String email;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "nationality", length = 50)
    private String nationality;

    @Column(name = "active")
    private Boolean active = true;
}