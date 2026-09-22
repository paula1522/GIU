package com.giu.controller;

import java.util.List;

import javax.validation.Valid;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giu.model.RespuestaGenerica;
import com.giu.model.gestionRoles.GestionarRecursosRolRequestDTO;
import com.giu.model.gestionRoles.RecursosRolResponseDTO;
import com.giu.model.gestionUsuarios.UsuarioRolResponseDTO;
import com.giu.service.GestionRolesService;
import com.giu.service.GestionUsuariosService;
import com.giu.utils.TipoRespuesta;

@RestController
@RequestMapping("/api/roles/{rolId}")
public class RolController {

        private static final Logger logger = LogManager.getLogger(RolController.class);

        private final GestionRolesService rolesService;
        private final GestionUsuariosService usuarioService;

        public RolController(GestionRolesService rolesService, GestionUsuariosService usuarioService) {
                this.rolesService = rolesService;
                this.usuarioService = usuarioService;
        }

        /* GESTIONAR ROLES DE UNA APLICACIÓN */


        /**
         * Asignar recursos a un rol
         *
         * Método: POST
         * Ruta: /api/roles/{rolId}/recursos
         *
         * Ejemplo de cuerpo de la solicitud:
         *
         * {
         * "recursos": [1, 2, 3]
         * }
         */
        @PostMapping("/recursos")
        public ResponseEntity<RespuestaGenerica<List<RecursosRolResponseDTO>>> asignarRecursos(
                        @PathVariable Long rolId,
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @Valid @RequestBody GestionarRecursosRolRequestDTO request) {

                logger.info("POST /roles/{}/recursos - recursos={}",
                                rolId,
                                request.getRecursos());

                List<RecursosRolResponseDTO> recursos = rolesService.asignarRecursos(
                                rolId,
                                request,
                                usuarioModificacion);

                RespuestaGenerica<List<RecursosRolResponseDTO>> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                recursos);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Retirar recursos de un rol
         *
         * Método: DELETE
         * Ruta: /api/roles/{rolId}/recursos
         *
         * Ejemplo de cuerpo de la solicitud:
         *
         * {
         * "recursos": [1, 2]
         * }
         */
        @DeleteMapping("/recursos")
        public ResponseEntity<RespuestaGenerica<List<RecursosRolResponseDTO>>> retirarRecursos(
                        @PathVariable Long rolId,
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @Valid @RequestBody GestionarRecursosRolRequestDTO request) {

                logger.info("DELETE /roles/{}/recursos - recursos={}",
                                rolId,
                                request.getRecursos());

                List<RecursosRolResponseDTO> recursos = rolesService.retirarRecursos(
                                rolId,
                                request,
                                usuarioModificacion);

                RespuestaGenerica<List<RecursosRolResponseDTO>> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                recursos);

                return ResponseEntity.ok(respuesta);
        }

        @GetMapping("/usuarios")
        public ResponseEntity<RespuestaGenerica<List<UsuarioRolResponseDTO>>> obtenerUsuariosRol(
                        @PathVariable Long rolId) {

                logger.info("obtenerUsuariosRol - inicio. rolId={}", rolId);

                List<UsuarioRolResponseDTO> result = usuarioService.obtenerUsuariosRol(rolId);

                logger.info("obtenerUsuariosRol - fin OK. rolId={}, total={}",
                                rolId,
                                result.size());

                RespuestaGenerica<List<UsuarioRolResponseDTO>> RespuestaGenerica = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                result);
                return ResponseEntity.ok(RespuestaGenerica);
        }
/* 
        */
}