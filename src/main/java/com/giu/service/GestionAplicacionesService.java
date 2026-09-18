package com.giu.service;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import com.giu.model.gestionAplicaciones.AdministradorAplicacionResponseDTO;
import com.giu.model.gestionAplicaciones.AplicacionResponseDTO;
import com.giu.model.gestionAplicaciones.CrearAplicacionRequest;
import com.giu.model.gestionAplicaciones.GestionarAdministradorRequest;
import com.giu.model.gestionAplicaciones.ModificarAplicacionRequest;
import com.giu.repository.GestionAplicacionesRepository;
import com.giu.utils.Constantes;

@Service
public class GestionAplicacionesService {

    private static final Logger logger = LogManager.getLogger(GestionAplicacionesService.class);

    // Se inyecta el repositorio de gestión de aplicaciones en el servicio
    private final GestionAplicacionesRepository gestionAplicacionesRepository;

    // Constructor para inyectar el repositorio de gestión de aplicaciones
    public GestionAplicacionesService(GestionAplicacionesRepository gestionAplicacionesRepository) {
        this.gestionAplicacionesRepository = gestionAplicacionesRepository;
    }

    // Método para obtener aplicación según el codigo y el estado
    public List<AplicacionResponseDTO> obtenerAplicacion(String codigo, String estado, String nombre) {
        logger.info("obtenerAplicacion - inicio. codigo={}, estado={}, nombre={}", codigo, estado, nombre);

        List<AplicacionResponseDTO> result = gestionAplicacionesRepository.obtenerAplicacion(codigo, estado, nombre);

        logger.info("obtenerAplicacion - fin OK. total={}", result.size());
        return result;
    }

    // Método obtener los administradores de las aplicaciones
    public List<AdministradorAplicacionResponseDTO> obtenerAdministradorAplicacion(String usuarioRed, Long apliId) {
        logger.info("obtenerAdministradorAplicacion - inicio. usuarioRed={}, apliId={}", usuarioRed, apliId);

        List<AdministradorAplicacionResponseDTO> result = gestionAplicacionesRepository
                .obtenerAdministradorAplicacion(usuarioRed, apliId);

        logger.info("obtenerAdministradorAplicacion - fin OK. total={}", result.size());
        return result;
    }

    // Método crear aplicación
    public AplicacionResponseDTO crearAplicacion(CrearAplicacionRequest request, String usuarioCreacion) {
        logger.info("crearAplicacion - inicio. codigo={}", request.getCodigo());

        AplicacionResponseDTO result = gestionAplicacionesRepository.crearAplicacion(
                request.getCodigo(),
                request.getNombre(),
                request.getDescripcion(),
                request.getAdministracion(),
                usuarioCreacion);

        logger.info("crearAplicacion - fin OK. codigo={}, id={}",
                request.getCodigo(), result != null ? result.getId() : null);
        return result;
    }

    // Método modificar aplicación
    public AplicacionResponseDTO modificarAplicacion(Long id, ModificarAplicacionRequest request,
            String usuarioModificacion) {
        logger.info("modificarAplicacion - inicio. id={}", id);

        AplicacionResponseDTO result = gestionAplicacionesRepository.modificarAplicacion(
                id,
                request.getNombre(),
                request.getCodigo(),
                request.getDescripcion(),
                request.getEstado(),
                request.getAdministracion(),
                usuarioModificacion);

        logger.info("modificarAplicacion - fin OK. id={}", id);
        return result;
    }

    // Método para asignar administradores de aplicaciones
    public AdministradorAplicacionResponseDTO crearAdministrador(GestionarAdministradorRequest request,
            String usuarioModificacion) {
        logger.info("crearAdministrador - inicio. usuarioRed={}, apliId={}",
                request.getUsuarioRed(), request.getApliId());

        AdministradorAplicacionResponseDTO result = gestionAplicacionesRepository.gestionarAdministrador(
                request, usuarioModificacion, Constantes.OPERACION_ASIGNAR);

        logger.info("crearAdministrador - fin OK. usuarioRed={}, apliId={}",
                request.getUsuarioRed(), request.getApliId());
        return result;
    }

    // Método para retirar administradores de aplicaciones
    public AdministradorAplicacionResponseDTO retirarAdministrador(GestionarAdministradorRequest request,
            String usuarioModificacion) {
        logger.info("retirarAdministrador - inicio. usuarioRed={}, apliId={}",
                request.getUsuarioRed(), request.getApliId());

        AdministradorAplicacionResponseDTO result = gestionAplicacionesRepository.gestionarAdministrador(
                request, usuarioModificacion, Constantes.OPERACION_RETIRAR);

        logger.info("retirarAdministrador - fin OK. usuarioRed={}, apliId={}",
                request.getUsuarioRed(), request.getApliId());
        return result;
    }
}