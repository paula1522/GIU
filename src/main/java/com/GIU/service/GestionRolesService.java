package com.giu.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.giu.model.RolResponseDTO;
import com.giu.repository.GestionRolesRepository;

@Service 
public class GestionRolesService {

    private final GestionRolesRepository gestionRolesRepository;

        public GestionRolesService(GestionRolesRepository gestionRolesRepository) {
                this.gestionRolesRepository = gestionRolesRepository;
        }
    public List<RolResponseDTO> obtenerRoles(Long apliId) {

    return gestionRolesRepository.obtenerRoles(apliId);
}
}
