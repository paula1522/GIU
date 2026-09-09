package com.GIU.BACKEND.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.GIU.BACKEND.model.RolResponseDTO;
import com.GIU.BACKEND.repository.GestionRolesRepository;

@Service 
public class GestionRolesService {

    GestionRolesRepository gestionRolesRepository = new GestionRolesRepository();
    public List<RolResponseDTO> obtenerRoles(Long apliId) {

    return gestionRolesRepository.obtenerRoles(apliId);
}
}
