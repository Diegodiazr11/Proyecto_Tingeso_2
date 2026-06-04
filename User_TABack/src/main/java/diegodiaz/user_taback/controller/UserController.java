package diegodiaz.user_taback.controller;

import diegodiaz.user_taback.dto.UserDTO;
import diegodiaz.user_taback.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasRole('admin_client_role')")
    @GetMapping("/search")
    public ResponseEntity<?> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @GetMapping("/role")
    public ResponseEntity<?> getRole(@RequestParam String userId) {
        return ResponseEntity.ok(userService.getUserRoles(userId));
    }

    @GetMapping("/search/{keycloakId}")
    @PreAuthorize("hasRole('admin_client_role') or #keycloakId == authentication.principal.subject")
    public ResponseEntity<?> findByKeycloakId(@PathVariable String keycloakId) {
        return ResponseEntity.ok(userService.findOrSyncUser(keycloakId));
    }

    @PutMapping("/update/{userId}")
    @PreAuthorize("hasRole('admin_client_role') or #userId == authentication.principal.subject")
    public ResponseEntity<Void> updateUser(@PathVariable String userId, @RequestBody UserDTO userDTO) {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_admin_client_role"));

        if (!isAdmin) userDTO.setRoles(null);

        userService.updateUser(userId, userDTO);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/deactivate/{userId}")
    @PreAuthorize("hasRole('admin_client_role') or #userId == authentication.principal.subject")
    public ResponseEntity<Void> deactivateUser(@PathVariable String userId) {
        userService.deactivateUser(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{userId}")
    @PreAuthorize("hasRole('admin_client_role') or #userId == authentication.principal.subject")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}