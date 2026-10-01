package com.giu.service;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import com.giu.model.gestionRecursos.CrearRecursoRequestDTO;
import com.giu.model.gestionRecursos.ModificarRecursoRequestDTO;
import com.giu.model.gestionRecursos.RecursoResponseDTO;
import com.giu.model.gestionRecursos.RecursoUsuarioResponseDTO;
import com.giu.model.gestionRecursos.RolRecursoResponseDTO;
import com.giu.repository.GestionRecursosRepository;

@Service
public class GestionRecursosService {

        private static final Logger logger = LogManager.getLogger(GestionRecursosService.class);

        // Se inyecta el repositorio de gestión de recursos en el servicio
        private final GestionRecursosRepository gestionRecursosRepository;

        // Constructor para inyectar el repositorio de gestión de recursos
        public GestionRecursosService(GestionRecursosRepository gestionRecursosRepository) {
                this.gestionRecursosRepository = gestionRecursosRepository;
        }

        // Método para obtener los recursos de una aplicación según el estado
        public List<RecursoResponseDTO> obtenerRecurso(Long apliId, String estado) {
                logger.info("obtenerRecurso - inicio. apliId={}, estado={}", apliId, estado);

                List<RecursoResponseDTO> result = gestionRecursosRepository.obtenerRecurso(apliId, estado);

                logger.info("obtenerRecurso - fin OK. total={}", result.size());
                return result;
        }

        // Método para obtener los recursos asignados a un usuario
        public List<RecursoUsuarioResponseDTO> obtenerRecursoUsuario(String usuarioRed, Long apliId) {
                logger.info("obtenerRecursoUsuario - inicio. usuarioRed={}, apliId={}",
                                usuarioRed, apliId);

                List<RecursoUsuarioResponseDTO> result = gestionRecursosRepository.obtenerRecursoUsuario(usuarioRed,
                                apliId);

                logger.info("obtenerRecursoUsuario - fin OK. total={}", result.size());
                return result;
        }

        public List<RolRecursoResponseDTO> obtenerRolesRecurso(Long recuId) {

                logger.info("obtenerRolesRecurso - inicio. recuId={}", recuId);

                List<RolRecursoResponseDTO> roles = gestionRecursosRepository.obtenerRolesRecurso(recuId);

                logger.info("obtenerRolesRecurso - fin OK. total={}", roles.size());

                return roles;
        }

        // Método para crear recurso
        public RecursoResponseDTO crearRecurso(Long apliId, CrearRecursoRequestDTO request) {
                logger.info("crearRecurso - inicio. apliId={}, codigo={}", apliId, request.getCodigo());

                RecursoResponseDTO result = gestionRecursosRepository.crearRecurso(apliId, request);

                logger.info("crearRecurso - fin OK. apliId={}, codigo={}, id={}",
                                apliId, request.getCodigo(), result != null ? result.getId() : null);

                return result;
        }

        // Método para modificar recurso
        public RecursoResponseDTO modificarRecurso(Long apliId, Long recuId, ModificarRecursoRequestDTO request) {
                logger.info("modificarRecurso - inicio. id={}, apliId={}",
                                recuId, apliId);

                RecursoResponseDTO result = gestionRecursosRepository.modificarRecurso(apliId, recuId, request);

                logger.info("modificarRecurso - fin OK. id={}, apliId={}", recuId, apliId);

                return result;
        }

        // Método para eliminar (o inactivar) un recurso
        public String eliminarRecurso(Long recuId, Long apliId) {
                logger.info("eliminarRecurso - inicio. id={}, apliId={}", recuId, apliId);

                String mensaje = gestionRecursosRepository.eliminarRecurso(recuId, apliId);

                logger.info("eliminarRecurso - fin OK. id={}, apliId={}, mensaje={}", recuId, apliId, mensaje);

                return mensaje;
        }

}