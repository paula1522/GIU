package com.giu.service;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.stereotype.Service;

import com.giu.model.gestionAplicaciones.AdministradorAplicacionResponseDTO;
import com.giu.model.gestionAplicaciones.AplicacionResponseDTO;
import com.giu.model.gestionAplicaciones.CrearAplicacionRequest;
import com.giu.model.gestionAplicaciones.GestionarAdministradorRequest;
import com.giu.model.gestionAplicaciones.ModificarAplicacionRequest;
import com.giu.repository.GestionAplicacionesRepository;

@Service
public class GestionAplicacionesService {

    // Se inyecta el repositorio de gestión de aplicaciones en el servicio
    private final GestionAplicacionesRepository gestionAplicacionesRepository;

    // Constructor para inyectar el repositorio de gestión de aplicaciones
    public GestionAplicacionesService(GestionAplicacionesRepository gestionAplicacionesRepository) {
        this.gestionAplicacionesRepository = gestionAplicacionesRepository;
    }

    // Método para obtener aplicación según el codigo y el estado
    public List<AplicacionResponseDTO> obtenerAplicacion(String codigo, String estado) {
        return gestionAplicacionesRepository.obtenerAplicacion(codigo, estado);
    }

    // Método obtener los administradores de las aplicaciones
    public List<AdministradorAplicacionResponseDTO> obtenerAdministradorAplicacion(String usuarioRed, Long apliId) {
        return gestionAplicacionesRepository.obtenerAdministradorAplicacion(usuarioRed, apliId);
    }

    // Método crear aplicación
    public AplicacionResponseDTO crearAplicacion(CrearAplicacionRequest request, String usuarioCreacion) {

        return gestionAplicacionesRepository.crearAplicacion(
                request.getCodigo(),
                request.getNombre(),
                request.getDescripcion(),
                request.getAdministracion(),
                usuarioCreacion);
    }

    // Método modificar aplicación
    public AplicacionResponseDTO modificarAplicacion(Long id, ModificarAplicacionRequest request, String usuarioModificacion) {

        return gestionAplicacionesRepository.modificarAplicacion(
                id,
                request.getNombre(),
                request.getCodigo(),
                request.getDescripcion(),
                request.getEstado(),
                request.getAdministracion(),
                usuarioModificacion);
    }

    // Método para asignar administradores de aplicaciones
    public AdministradorAplicacionResponseDTO crearAdministrador(GestionarAdministradorRequest request, String usuarioModificacion) {

        return gestionAplicacionesRepository.gestionarAdministrador(request,usuarioModificacion,0);
    }

    // Método para retirar administradores de aplicaciones
    public AdministradorAplicacionResponseDTO retirarAdministrador(GestionarAdministradorRequest request, String usuarioModificacion) {

        return gestionAplicacionesRepository.gestionarAdministrador(request,usuarioModificacion,1);
    }

    
}
