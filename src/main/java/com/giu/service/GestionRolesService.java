package com.giu.service;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import com.giu.model.gestionRoles.RolResponseDTO;
import com.giu.repository.GestionRolesRepository;

@Service
public class GestionRolesService {

    private static final Logger logger = LogManager.getLogger(GestionRolesService.class);

    // Se inyecta el repositorio de gestión de roles en el servicio
    private final GestionRolesRepository gestionRolesRepository;

    // Constructor para inyectar el repositorio de gestión de roles
    public GestionRolesService(GestionRolesRepository gestionRolesRepository) {
        this.gestionRolesRepository = gestionRolesRepository;
    }

    // Método para obtener los roles asociados a una aplicación específica
    public List<RolResponseDTO> obtenerRoles(Long apliId) {
        logger.info("obtenerRoles - inicio. apliId={}", apliId);

        List<RolResponseDTO> result = gestionRolesRepository.obtenerRoles(apliId);

        logger.info("obtenerRoles - fin OK. apliId={}, total={}", apliId, result.size());
        return result;
    }
}