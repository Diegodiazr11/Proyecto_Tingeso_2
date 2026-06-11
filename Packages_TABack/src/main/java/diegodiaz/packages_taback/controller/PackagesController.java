package diegodiaz.packages_taback.controller;

import diegodiaz.packages_taback.entity.PackagesEntity;
import diegodiaz.packages_taback.service.PackagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/package")
public class PackagesController {

    @Autowired
    private PackagesService packageServ;

    @PreAuthorize("hasRole('admin_client_role')")
    @GetMapping("/all")
    public ResponseEntity<List<PackagesEntity>> findAll() {
        List<PackagesEntity> packages = packageServ.getAllPackaegs();
        return ResponseEntity.ok(packages);
    }

    @GetMapping("search/{id}")
    public ResponseEntity<PackagesEntity> findById(@PathVariable Long id) throws Exception {
        PackagesEntity packages = packageServ.getPackaesById(id);
        return ResponseEntity.ok(packages);
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @PutMapping("/update/{id}")
    public ResponseEntity updatePackages(@PathVariable Long id, @RequestBody PackagesEntity entity) throws Exception {
        PackagesEntity packagesUpdated = packageServ.updatePackages(id, entity);
        return ResponseEntity.ok(packagesUpdated);
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @DeleteMapping("delete/{id}")
    public ResponseEntity<PackagesEntity> deletePackages(@PathVariable Long id) throws Exception {
        var isDeleted = packageServ.deletePackageById(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @PutMapping("/deactivate/{id}")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        try {
            packageServ.deactivatePackage(id);
            return ResponseEntity.ok("Paquete desactivado");
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('admin_client_role')")
    @PostMapping("/register")
    public ResponseEntity<?> registerPackage(@RequestBody PackagesEntity packages) {
        try {
            PackagesEntity newPackage = packageServ.registerPackage(packages);
            return ResponseEntity.ok(newPackage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    @PutMapping("/{id}/quotas")
    public ResponseEntity<?> updateQuotas(@PathVariable Long id, @RequestParam int delta) {
        try {
            packageServ.updateQuotas(id, delta);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<PackagesEntity>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String classification,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double minDuration,
            @RequestParam(required = false) Double maxDuration,
            @RequestParam(required = false) String sortBy) {

        List<PackagesEntity> results = packageServ.searchPackages(
                search, classification, minPrice, maxPrice,
                startDate, endDate, minDuration, maxDuration, sortBy
        );
        return ResponseEntity.ok(results);
    }
}
