package diegodiaz.user_taback.util;

import jakarta.annotation.PreDestroy;
import org.jboss.resteasy.client.jaxrs.internal.ResteasyClientBuilderImpl;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


@Component
public class KeycloakProvider {

    @Value("http://${KC_HOST}")
    private String serverUrl;

    @Value("${KC_REALM_NAME}")
    private String realmName;

    @Value("${KC_USER_CONSOLE}")
    private String userConsole;

    @Value("${KC_USER_PASSWORD}")
    private String userPassword;

    private Keycloak keycloak;

    private Keycloak getKeycloakInstance() {
        if (keycloak == null) {
            keycloak = KeycloakBuilder.builder()
                    .serverUrl(serverUrl)
                    .realm("master")
                    .clientId("admin-cli")
                    .username(userConsole)
                    .password(userPassword)
                    .resteasyClient(new ResteasyClientBuilderImpl()
                            .connectionPoolSize(10)
                            .build())
                    .build();
        }
        return keycloak;
    }

    public RealmResource getRealmResource() {
        return getKeycloakInstance().realm(realmName);
    }

    public UsersResource getUserResource() {
        return getRealmResource().users();
    }

    @PreDestroy
    public void close() {
        if (keycloak != null) {
            keycloak.close();
        }
    }
}

