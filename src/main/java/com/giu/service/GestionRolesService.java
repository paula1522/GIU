package com.giu.service;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import com.giu.model.gestionRoles.CrearRolRequestDTO;
import com.giu.model.gestionRoles.DetalleRolResponseDTO;
import com.giu.model.gestionRoles.GestionarRecursosRolRequestDTO;
import com.giu.model.gestionRoles.ModificarRolRequestDTO;
import com.giu.model.gestionRoles.RecursosRolResponseDTO;
import com.giu.model.gestionRoles.RolResponseDTO;
import com.giu.repository.GestionRolesRepository;
import com.giu.utils.Constantes;

@Service
public class GestionRolesService {

        private static final Logger logger = LogManager.getLogger(GestionRolesService.class);

        // Se inyecta el repositorio de gestión de roles en el servicio
        private final GestionRolesRepository gestionRolesRepository;

        // Constructor para inyectar el repositorio de gestión de roles
        public GestionRolesService(GestionRolesRepository gestionRolesRepository) {
                this.gestionRolesRepository = gestionRolesRepository;
        }

        // Método para obtener los roles asociados a una aplicación
        public List<RolResponseDTO> obtenerRoles(Long apliId, String estado) {
                logger.info("obtenerRoles - inicio. apliId={}, estado={}", apliId, estado);

                List<RolResponseDTO> result = gestionRolesRepository.obtenerRoles(null, apliId, estado);

                logger.info("obtenerRoles - fin OK. apliId={}, total={}", apliId, result.size());

                return result;
        }

        // Método para obtener los recursos asociados a un rol
        public List<RecursosRolResponseDTO> obtenerRecursosRol(Long rolId) {
                logger.info("obtenerRecursosRol - inicio. rolId={}", rolId);

                List<RecursosRolResponseDTO> result = gestionRolesRepository.obtenerRecursosRol(rolId);

                logger.info("obtenerRecursosRol - fin OK. rolId={}, total={}", rolId, result.size());

                return result;
        }

        // Método para crear un rol
        public RolResponseDTO crearRol(Long apliId, CrearRolRequestDTO request, String usuarioCreacion) {

                logger.info("crearRol - inicio. apliId={}, nombre={}", apliId, request.getNombre());

                RolResponseDTO result = gestionRolesRepository.crearRol(apliId, request, usuarioCreacion);

                logger.info("crearRol - fin OK. apliId={}, id={}", apliId, result != null ? result.getId() : null);

                return result;
        }

        // Método para modificar un rol
        public RolResponseDTO modificarRol(Long rolId, Long apliId, ModificarRolRequestDTO request,
                        String usuarioModificacion) {

                logger.info("modificarRol - inicio. rolId={}, apliId={}", rolId, apliId);

                RolResponseDTO result = gestionRolesRepository.modificarRol(rolId, apliId, request,
                                usuarioModificacion);

                logger.info("modificarRol - fin OK. rolId={}, apliId={}", rolId, apliId);

                return result;
        }

        // Método para asignar recursos a un rol
        public List<RecursosRolResponseDTO> asignarRecursos(Long rolId, GestionarRecursosRolRequestDTO request,
                        String usuarioModificacion) {

                logger.info("asignarRecursos - inicio. rolId={}, recursos={}", rolId, request.getRecursos());

                List<RecursosRolResponseDTO> result = gestionRolesRepository.gestionarRecursosRol(
                                request, rolId, Constantes.OPERACION_ASIGNAR, usuarioModificacion);

                logger.info("asignarRecursos - fin OK. rolId={}, total={}", rolId, result.size());

                return result;
        }

        // Método para retirar recursos de un rol
        public List<RecursosRolResponseDTO> retirarRecursos(Long rolId, GestionarRecursosRolRequestDTO request,
                        String usuarioModificacion) {

                logger.info("retirarRecursos - inicio. rolId={}, recursos={}", rolId, request.getRecursos());

                List<RecursosRolResponseDTO> result = gestionRolesRepository.gestionarRecursosRol(request, rolId,
                                Constantes.OPERACION_RETIRAR, usuarioModificacion);

                logger.info("retirarRecursos - fin OK. rolId={}, total={}", rolId, result.size());

                return result;
        }

        public DetalleRolResponseDTO obtenerDetalleRol(Long rolId) {

                logger.info("obtenerDetalleRol - inicio. rolId={}", rolId);

                List<RolResponseDTO> roles = gestionRolesRepository.obtenerRoles(rolId, null, null);

                if (roles.isEmpty()) {

                        logger.warn("obtenerDetalleRol - no se encontró el rol. rolId={}",
                                        rolId);

                        return null;
                }

                RolResponseDTO rol = roles.get(0);

                List<RecursosRolResponseDTO> recursos = gestionRolesRepository.obtenerRecursosRol(rolId);

                DetalleRolResponseDTO result = new DetalleRolResponseDTO();

                result.setId(rol.getId());
                result.setApliId(rol.getApliId());
                result.setNombre(rol.getNombre());
                result.setDescripcion(rol.getDescripcion());
                result.setEstado(rol.getEstado());
                result.setFechaCreacion(rol.getFechaCreacion());
                result.setUsuarioCreacion(rol.getUsuarioCreacion());
                result.setFechaModificacion(rol.getFechaModificacion());
                result.setUsuarioModificacion(rol.getUsuarioModificacion());
                result.setRecursos(recursos);

                logger.info("obtenerDetalleRol - fin OK. rolId={}, recursos={}",
                                rolId,
                                recursos.size());

                return result;
        }

}