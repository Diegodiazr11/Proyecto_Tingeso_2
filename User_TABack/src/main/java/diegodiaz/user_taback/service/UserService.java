package diegodiaz.user_taback.service;

import diegodiaz.user_taback.dto.UserDTO;
import diegodiaz.user_taback.entity.UserEntity;
import diegodiaz.user_taback.repository.UserRepository;
import diegodiaz.user_taback.util.KeycloakProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final KeycloakProvider keycloakProvider;
    private final UserRepository userRepository;

    public List<UserEntity> findAll() {
        return userRepository.findAll();
    }

    public UserEntity findOrSyncUser(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId).orElseGet(() -> {

            UserRepresentation ku = keycloakProvider.getUserResource()
                    .get(keycloakId)
                    .toRepresentation();

            UserEntity user = new UserEntity();
            user.setKeycloakId(ku.getId());
            user.setUsername(ku.getUsername() != null ? ku.getUsername() : "");
            user.setFirstName(ku.getFirstName() != null ? ku.getFirstName() : "");
            user.setLastName(ku.getLastName() != null ? ku.getLastName() : "");
            user.setEmail(ku.getEmail() != null ? ku.getEmail() : "");

            Map<String, List<String>> attrs = ku.getAttributes();
            if (attrs != null) {
                List<String> doc = attrs.getOrDefault("document", List.of());
                user.setDocument(doc.isEmpty() ? null : doc.get(0));

                List<String> phone = attrs.getOrDefault("phone", List.of());
                user.setPhone(phone.isEmpty() ? null : phone.get(0));

                List<String> nationality = attrs.getOrDefault("nationality", List.of());
                user.setNationality(nationality.isEmpty() ? null : nationality.get(0));
            }

            user.setActive(true);
            return userRepository.save(user);
        });
    }


    public List<String> getUserRoles(String userId) {
        return keycloakProvider.getRealmResource()
                .users()
                .get(userId)
                .roles()
                .realmLevel()
                .listEffective()
                .stream()
                .map(RoleRepresentation::getName)
                .toList();
    }


    public void updateUser(String userId, UserDTO userDTO) {

        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setFirstName(userDTO.getFirstName());
        userRepresentation.setLastName(userDTO.getLastName());
        userRepresentation.setEmail(userDTO.getEmail());
        userRepresentation.setEmailVerified(true);
        userRepresentation.setEnabled(true);

        Map<String, List<String>> attributes = new HashMap<>();
        if (userDTO.getPhone() != null)       attributes.put("phone",       List.of(userDTO.getPhone()));
        if (userDTO.getDocument() != null)    attributes.put("document",    List.of(userDTO.getDocument()));
        if (userDTO.getNationality() != null) attributes.put("nationality", List.of(userDTO.getNationality()));
        userRepresentation.setAttributes(attributes);

        UserResource userResource = keycloakProvider.getUserResource().get(userId);
        userResource.update(userRepresentation);

        if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) {
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setTemporary(false);
            credential.setType(OAuth2Constants.PASSWORD);
            credential.setValue(userDTO.getPassword());
            userResource.resetPassword(credential);
        }

        if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
            RealmResource realmResource = keycloakProvider.getRealmResource();

            List<RoleRepresentation> currentRoles = userResource.roles().realmLevel().listAll();
            userResource.roles().realmLevel().remove(currentRoles);

            List<RoleRepresentation> newRoles = userDTO.getRoles().stream()
                    .map(roleName -> realmResource.roles().get(roleName).toRepresentation())
                    .collect(Collectors.toList());
            userResource.roles().realmLevel().add(newRoles);
        }

        updateUserInDB(userId, userDTO);
    }

    @Transactional
    public void deactivateUser(String userId) {
        UserEntity user = userRepository.findByKeycloakId(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        UserRepresentation keycloakUser = keycloakProvider.getUserResource()
                .get(userId)
                .toRepresentation();
        keycloakUser.setEnabled(false);
        keycloakProvider.getUserResource().get(userId).update(keycloakUser);

        user.setActive(false);
        userRepository.save(user);
        log.info("User deactivated: {}", userId);
    }

    @Transactional
    public void deleteUser(String userId) {
        UserEntity user = userRepository.findByKeycloakId(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        keycloakProvider.getUserResource().get(userId).remove();
        userRepository.delete(user);
        log.info("User deleted: {}", userId);
    }

    private UserEntity updateUserInDB(String keycloakId, UserDTO userDTO) {
        UserEntity user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new RuntimeException("User not found: " + keycloakId));

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        user.setDocument(userDTO.getDocument());
        user.setNationality(userDTO.getNationality());
        return userRepository.save(user);
    }
}