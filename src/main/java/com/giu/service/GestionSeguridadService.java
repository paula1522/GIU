package com.giu.service;

import java.time.LocalDateTime;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import com.giu.model.gestionSeguridad.GestionarEstadoUsuarioRequest;
import com.giu.model.gestionUsuarios.GestionarRolUsuarioRequestDTO;
import com.giu.repository.GestionSeguridadRepository;
import com.giu.utils.Constantes;

@Service
public class GestionSeguridadService {

    private static final Logger logger = LogManager.getLogger(GestionSeguridadService.class);

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

        logger.info("gestionarEstadoUsuario - inicio. usuarioRed={}, apliId={}, operacion={}",
                request.getUsuarioRed(), request.getApliId(), request.getOperacion());

        gestionSeguridadRepository.gestionarEstadoUsuario(request);

        if (request.getOperacion() == Constantes.OPERACION_ACTIVAR && request.getRolId() != null) {

            logger.info("gestionarEstadoUsuario - asignando rol al activar. usuarioRed={}, rolId={}",
                    request.getUsuarioRed(), request.getRolId());

            GestionarRolUsuarioRequestDTO requestRol = new GestionarRolUsuarioRequestDTO();
            requestRol.setRolId(request.getRolId());
            requestRol.setUsuarioRed(request.getUsuarioRed());
            requestRol.setFechaIn(LocalDateTime.now());
            requestRol.setFechaFin(null);

            gestionUsuariosService.asignarRolUsuario(request.getApliId(), requestRol, usuarioModificacion);
        }

        logger.info("gestionarEstadoUsuario - fin OK. usuarioRed={}, operacion={}",
                request.getUsuarioRed(), request.getOperacion());
    }
}