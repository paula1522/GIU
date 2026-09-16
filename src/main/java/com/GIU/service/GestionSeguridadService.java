package com.giu.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.giu.model.gestionSeguridad.GestionarEstadoUsuarioRequest;
import com.giu.model.gestionUsuarios.GestionarRolUsuarioRequestDTO;
import com.giu.repository.GestionSeguridadRepository;

@Service
public class GestionSeguridadService {

    private final GestionUsuariosService gestionUsuariosService;
    // Se inyecta el repositorio de gestión de seguridad en el servicio
    private final GestionSeguridadRepository gestionSeguridadRepository;

    // Constructor para inyectar el repositorio de gestión de seguridad
    public GestionSeguridadService(GestionSeguridadRepository gestionSeguridadRepository,
            GestionUsuariosService gestionUsuariosService) {
        this.gestionSeguridadRepository = gestionSeguridadRepository;
        this.gestionUsuariosService = gestionUsuariosService;
    }

    // Método para gestionar el estado de un usuario en el sistema
    public void gestionarEstadoUsuario(
            GestionarEstadoUsuarioRequest request, String usuarioModificacion) {

        gestionSeguridadRepository.gestionarEstadoUsuario(request);
        if (request.getOperacion() == 0 && request.getRolId() != null) {
            GestionarRolUsuarioRequestDTO requestRol = new GestionarRolUsuarioRequestDTO();

            requestRol.setRolId(request.getRolId());
            requestRol.setUsuarioRed(request.getUsuarioRed());
            requestRol.setFechaIn(LocalDateTime.now());
            requestRol.setFechaFin(null);

            gestionUsuariosService.asignarRolUsuario(request.getApliId(),requestRol,usuarioModificacion);
        }
    }
}
