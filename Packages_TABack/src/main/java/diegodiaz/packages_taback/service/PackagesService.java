package diegodiaz.packages_taback.service;

import diegodiaz.packages_taback.entity.PackagesEntity;
import diegodiaz.packages_taback.repository.PackagesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PackagesService {

    @Autowired
    private PackagesRepository packageRepo;

    public List<PackagesEntity> getAllPackaegs() {
        return packageRepo.findAll();
    }

    public PackagesEntity getPackaesById(Long id) throws  Exception {
        return packageRepo.findById(id)
                .orElseThrow(() -> new Exception ("Paquete no econtado con el id: " + id));
    }

    public PackagesEntity updatePackages(Long id, PackagesEntity packages) throws Exception  {

        packageRepo.findById(id)
                .orElseThrow(() -> new Exception("Paquete no encontrado con id: " + id));

        if(packages.getPricePackage() < 0){
            throw new Exception("El precio del paquete no puede ser menor que 0");
        }

        if(packages.getDurationPackage() < 0){
            throw new Exception("La duración no puede ser menor que 0");
        }

        if(packages.getAvailableQuotas() < 0){
            throw new Exception("Los cupos no pueden ser menor a 0");
        }

        packages.setId(id);
        return packageRepo.save(packages);
    }

    public boolean deletePackageById(Long id) throws  Exception {
        try{
            packageRepo.deleteById(id);
            return true;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    public boolean deactivatePackage(Long id) throws Exception {
        PackagesEntity packages  = packageRepo.findById(id)
                .orElseThrow(() -> new Exception("Paquete no encontrado"));
        if (!packages.isStatus()) throw new Exception("El paquete ya está desactivado");
        packages.setStatus(false);
        packageRepo.save(packages);
        return true;
    }

    public PackagesEntity registerPackage(PackagesEntity packages) throws Exception {

        if(packages.getPricePackage() < 0){
            throw new Exception("El precio del paquete no puede ser menor que 0");
        }

        if(packages.getDurationPackage() < 0){
            throw new Exception("La duración no puede ser menor que 0");
        }

        if(packages.getAvailableQuotas() < 0){
            throw new Exception("Los cupos no pueden ser menor que 0");
        }

        if (packages.getEndDate().isBefore(packages.getStartDate()) ||
                packages.getEndDate().isEqual(packages.getStartDate())) {
            throw new Exception("La fecha de término debe ser posterior a la fecha de inicio");
        }

        return packageRepo.save(packages);
    }

    public void updateQuotas(Long id, int delta) throws Exception {
        PackagesEntity packages = packageRepo.findById(id)
                .orElseThrow(() -> new Exception("Paquete no encontrado con id: " + id));

        int newQuotas = packages.getAvailableQuotas() + delta;
        if (newQuotas < 0)
            throw new Exception("Cupos insuficientes");

        packages.setAvailableQuotas(newQuotas);
        packageRepo.save(packages);
    }

    public List<PackagesEntity> searchPackages(
            String search,
            String classification,
            Double minPrice,
            Double maxPrice,
            LocalDate startDate,
            LocalDate endDate,
            Double minDuration,
            Double maxDuration,
            String sortBy) {

        String searchParam         = (search != null && !search.trim().isEmpty())         ? search.trim()         : null;
        String classificationParam = (classification != null && !classification.trim().isEmpty()) ? classification.trim() : null;
        String sortByParam         = (sortBy != null && !sortBy.trim().isEmpty())         ? sortBy.trim()         : null;

        return packageRepo.searchPackages(
                LocalDate.now(),
                searchParam,
                classificationParam,
                minPrice,
                maxPrice,
                startDate,
                endDate,
                minDuration,
                maxDuration,
                sortByParam
        );
    }
}