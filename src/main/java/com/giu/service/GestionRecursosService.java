package com.giu.service;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import com.giu.model.gestionRecursos.CrearRecursoRequestDTO;
import com.giu.model.gestionRecursos.ModificarRecursoRequestDTO;
import com.giu.model.gestionRecursos.RecursoResponseDTO;
import com.giu.model.gestionRecursos.RecursoUsuarioResponseDTO;
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

        // Método para crear recurso
        public RecursoResponseDTO crearRecurso(Long apliId, CrearRecursoRequestDTO request) {
                logger.info("crearRecurso - inicio. apliId={}, codigo={}", apliId, request.getCodigo());

                RecursoResponseDTO result = gestionRecursosRepository.crearRecurso(apliId, request);

                logger.info("crearRecurso - fin OK. apliId={}, codigo={}, id={}",
                                apliId, request.getCodigo(), result != null ? result.getId() : null);

                return result;
        }

        // Método para modificar recurso
        public RecursoResponseDTO modificarRecurso(Long recuId, Long apliId, ModificarRecursoRequestDTO request) {
                logger.info("modificarRecurso - inicio. id={}, apliId={}",
                                recuId, apliId);

                RecursoResponseDTO result = gestionRecursosRepository.modificarRecurso(recuId, apliId, request);

                logger.info("modificarRecurso - fin OK. id={}, apliId={}", recuId, apliId);

                return result;
        }
}