package com.giu.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.giu.model.RolResponseDTO;
import com.giu.repository.GestionRolesRepository;

@Service 
public class GestionRolesService {

    GestionRolesRepository gestionRolesRepository = new GestionRolesRepository();
    public List<RolResponseDTO> obtenerRoles(Long apliId) {

    return gestionRolesRepository.obtenerRoles(apliId);
}
}
