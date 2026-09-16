package com.giu.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.giu.model.gestionRoles.RolResponseDTO;
import com.giu.repository.GestionRolesRepository;

@Service
public class GestionRolesService {

    // Se inyecta el repositorio de gestión de roles en el servicio
    private final GestionRolesRepository gestionRolesRepository;

    // Constructor para inyectar el repositorio de gestión de roles
    public GestionRolesService(GestionRolesRepository gestionRolesRepository) {
        this.gestionRolesRepository = gestionRolesRepository;
    }

    // Método para obtener los roles asociados a una aplicación específica
    public List<RolResponseDTO> obtenerRoles(Long apliId) {

        return gestionRolesRepository.obtenerRoles(apliId);
    }
}
