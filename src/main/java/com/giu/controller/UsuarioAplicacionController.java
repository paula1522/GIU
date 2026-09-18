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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giu.model.gestionRoles.RolResponseDTO;
import com.giu.model.gestionUsuarios.GestionarRolUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.GestionarRolesUsuariosRequestDTO;
import com.giu.model.gestionUsuarios.UsuarioRolResponseDTO;
import com.giu.model.gestionUsuarios.UsuarioAplicacionResponseDTO;
import com.giu.service.GestionRecursosService;
import com.giu.service.GestionRolesService;
import com.giu.service.GestionUsuariosService;
import com.giu.model.RespuestaGenerica;
import com.giu.model.gestionRecursos.CrearRecursoRequestDTO;
import com.giu.model.gestionRecursos.ModificarRecursoRequestDTO;
import com.giu.model.gestionRecursos.RecursoResponseDTO;
import com.giu.model.gestionRecursos.RecursoUsuarioResponseDTO;
import com.giu.utils.Constantes;
import com.giu.utils.TipoRespuesta;

@RestController
@RequestMapping("/api/aplicaciones/{apliId}")
public class UsuarioAplicacionController {

        private static final Logger logger = LogManager.getLogger(UsuarioAplicacionController.class);

        private final GestionUsuariosService usuarioService;
        private final GestionRolesService rolesService;
        private final GestionRecursosService recursosService;

        public UsuarioAplicacionController(
                        GestionUsuariosService usuarioService,
                        GestionRolesService rolesService,
                        GestionRecursosService recursosService) {

                this.usuarioService = usuarioService;
                this.rolesService = rolesService;
                this.recursosService = recursosService;
        }

        /**
         * Consultar usuarios asociados a una aplicación
         *
         * Método: GET
         * Ruta: /api/aplicaciones/{apliId}/usuarios
         *
         * Ejemplo:
         * GET /api/aplicaciones/1/usuarios
         */
        @GetMapping("/usuarios")
        public ResponseEntity<RespuestaGenerica<List<UsuarioAplicacionResponseDTO>>> obtenerUsuariosPorAplicacion(
                        @PathVariable Long apliId,
                        @RequestParam(required = false, defaultValue = Constantes.ESTADO_ACTIVO) String estado) {

                logger.info("GET /aplicaciones/{}/usuarios - estado={}", apliId, estado);

                List<UsuarioAplicacionResponseDTO> usuarios = usuarioService.obtenerUsuariosPorAplicacion(apliId, estado);

                RespuestaGenerica<List<UsuarioAplicacionResponseDTO>> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                usuarios);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Consultar roles de una aplicación
         *
         * Método: GET
         * Ruta: /api/aplicaciones/{apliId}/roles
         *
         * Ejemplo:
         * GET /api/aplicaciones/1/roles
         */
        @GetMapping("/roles")
        public ResponseEntity<RespuestaGenerica<List<RolResponseDTO>>> obtenerRoles(
                        @PathVariable Long apliId) {

                logger.info("GET /aplicaciones/{}/roles", apliId);

                List<RolResponseDTO> roles = rolesService.obtenerRoles(apliId);

                RespuestaGenerica<List<RolResponseDTO>> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                roles);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Consultar asignación de rol de un usuario
         *
         * Método: GET
         * Ruta: /api/aplicaciones/{apliId}/rol/usuarios/{usuarioRed}
         *
         * Ejemplo:
         * GET /api/aplicaciones/1/rol/usuarios/UUU111
         */
        @GetMapping("/rol/usuario/{usuarioRed}")
        public ResponseEntity<RespuestaGenerica<UsuarioRolResponseDTO>> obtenerRolUsuario(
                        @PathVariable Long apliId,
                        @PathVariable String usuarioRed) {

                logger.info("GET /aplicaciones/{}/rol/usuarios/{}", apliId, usuarioRed);

                UsuarioRolResponseDTO resultado = usuarioService.obtenerRolUsuario(
                                usuarioRed,
                                apliId);

                RespuestaGenerica<UsuarioRolResponseDTO> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                resultado);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Asignar rol a un usuario para una aplicación específica
         *
         * Método: POST
         * Ruta: /api/aplicaciones/{apliId}/usuarios/asignacion-rol
         *
         * Ejemplo:
         * POST /api/aplicaciones/1/usuarios/asignacion-rol
         * 
         * Ejemplo de cuerpo de la solicitud:
         * 
         * {
         * "usuarioRed": "UUU633",
         * "rolId": 2
         * }
         */
        @PostMapping("/usuario/asignacion-rol")
        public ResponseEntity<RespuestaGenerica<UsuarioRolResponseDTO>> asignarRolUsuario(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @PathVariable Long apliId,
                        @Valid @RequestBody GestionarRolUsuarioRequestDTO request) {

                logger.info("POST /aplicaciones/{}/usuarios/asignacion-rol - usuarioRed={}, rolId={}",
                                apliId, request.getUsuarioRed(), request.getRolId());

                UsuarioRolResponseDTO usuarioRol = usuarioService.asignarRolUsuario(
                                apliId,
                                request,
                                usuarioModificacion);

                RespuestaGenerica<UsuarioRolResponseDTO> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                usuarioRol);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Renovar vigencia de una asignación de rol vencida
         *
         * Método: PUT
         * Ruta: /api/aplicaciones/{apliId}/usuario/vigencia
         *
         * Ejemplo:
         * PUT /api/aplicaciones/1/usuario/vigencia
         *
         * Ejemplo de cuerpo de la solicitud:
         * {
         * "usuarioRed": "UUU633",
         * "rolId": 1
         * }
         */
        @PutMapping("/usuario/vigencia")
        public ResponseEntity<RespuestaGenerica<UsuarioRolResponseDTO>> actualizarVigenciaRolUsuario(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @PathVariable Long apliId,
                        @Valid @RequestBody GestionarRolUsuarioRequestDTO request) {

                logger.info("PUT /aplicaciones/{}/usuario/vigencia - usuarioRed={}, rolId={}",
                                apliId, request.getUsuarioRed(), request.getRolId());

                UsuarioRolResponseDTO usuarioRol = usuarioService.actualizarVigenciaRolUsuario(
                                apliId,
                                request,
                                usuarioModificacion);

                RespuestaGenerica<UsuarioRolResponseDTO> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                usuarioRol);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Retirar rol a un usuario para una aplicación específica
         *
         * Método: DELETE
         * Ruta: /api/aplicaciones/{apliId}/usuarios/{usuarioRed}
         *
         * Ejemplo:
         * DELETE /api/aplicaciones/1/usuarios/uuu111
         */
        @DeleteMapping("/usuario/{usuarioRed}")
        public ResponseEntity<RespuestaGenerica<UsuarioRolResponseDTO>> retirarRolUsuario(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @PathVariable Long apliId,
                        @PathVariable String usuarioRed,
                        @Valid @RequestBody GestionarRolUsuarioRequestDTO request) {

                logger.info("DELETE /aplicaciones/{}/usuarios/{} - rolId={}",
                                apliId, usuarioRed, request.getRolId());

                request.setUsuarioRed(usuarioRed);

                UsuarioRolResponseDTO usuarioRol = usuarioService.retirarRolUsuario(
                                apliId,
                                request,
                                usuarioModificacion);

                RespuestaGenerica<UsuarioRolResponseDTO> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                usuarioRol);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Retirar rol a un usuario para una aplicación específica
         *
         * Método: DELETE
         * Ruta: /api/aplicaciones/{apliId}/usuario
         *
         * Ejemplo:
         * DELETE /api/aplicaciones/1/usuario
         */
        @DeleteMapping("/usuarios")
        public ResponseEntity<RespuestaGenerica<List<UsuarioRolResponseDTO>>> retirarRolesUsuarios(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @PathVariable Long apliId,
                        @Valid @RequestBody GestionarRolesUsuariosRequestDTO request) {

                logger.info("DELETE /aplicaciones/{}/usuario - total={}",
                                apliId, request.getUsuariosRed().size());

                List<UsuarioRolResponseDTO> usuariosRoles = usuarioService.retirarRolesUsuarios(apliId, request,
                                usuarioModificacion);

                RespuestaGenerica<List<UsuarioRolResponseDTO>> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                usuariosRoles);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Consultar recursos de una aplicación
         *
         * Método: GET
         * Ruta: /api/aplicaciones/{apliId}/recursos
         *
         * Ejemplo:
         * GET /api/aplicaciones/1/recursos?estado=ACTIVO
         */
        @GetMapping("/recursos")
        public ResponseEntity<RespuestaGenerica<List<RecursoResponseDTO>>> obtenerRecursos(
                        @PathVariable Long apliId,
                        @RequestParam(required = false, defaultValue = Constantes.ESTADO_ACTIVO) String estado) {

                logger.info(
                                "GET /aplicaciones/{}/recursos - estado={}",
                                apliId,
                                estado);

                List<RecursoResponseDTO> recursos = recursosService.obtenerRecurso(
                                apliId,
                                estado);

                RespuestaGenerica<List<RecursoResponseDTO>> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                recursos);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Crear recurso
         *
         * Método: POST
         * Ruta: /api/aplicaciones/{apliId}/recursos
         *
         * Ejemplo de cuerpo de la solicitud:
         *
         * {
         * "recuIdPadre": null,
         * "codigo": "MENU_USUARIOS",
         * "nombre": "Usuarios",
         * "descripcion": "Administración de usuarios",
         * "tipo": "MENU"
         * }
         */
        @PostMapping("/recursos")
        public ResponseEntity<RespuestaGenerica<RecursoResponseDTO>> crearRecurso(
                        @PathVariable Long apliId,
                        @Valid @RequestBody CrearRecursoRequestDTO request) {

                logger.info("POST /aplicaciones/{}/recursos - codigo={}",
                                apliId,
                                request.getCodigo());

                RecursoResponseDTO recurso = recursosService.crearRecurso(
                                apliId,
                                request);

                RespuestaGenerica<RecursoResponseDTO> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                recurso);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Modificar recurso
         *
         * Método: PUT
         * Ruta: /api/aplicaciones/{apliId}/recursos/{recuId}
         *
         * Ejemplo de cuerpo de la solicitud:
         *
         * {
         * "recuIdPadre": null,
         * "codigo": "MENU_USUARIOS",
         * "nombre": "Usuarios",
         * "descripcion": "Administración de usuarios",
         * "tipo": "MENU",
         * "estado": "ACTIVO"
         * }
         */
        @PutMapping("/recursos/{recuId}")
        public ResponseEntity<RespuestaGenerica<RecursoResponseDTO>> modificarRecurso(
                        @PathVariable Long apliId,
                        @PathVariable Long recuId,
                        @Valid @RequestBody ModificarRecursoRequestDTO request) {

                logger.info("PUT /aplicaciones/{}/recursos/{}",
                                apliId,
                                recuId);

                RecursoResponseDTO recurso = recursosService.modificarRecurso(
                                apliId,
                                recuId,
                                request);

                RespuestaGenerica<RecursoResponseDTO> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                recurso);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Consultar recursos asignados a un usuario
         *
         * Método: GET
         * Ruta: /api/aplicaciones/{apliId}/recursos/usuario/{usuarioRed}
         *
         * Ejemplo:
         * GET /api/aplicaciones/1/recursos/usuario/uuu111
         */
        @GetMapping("/recursos/usuario/{usuarioRed}")
        public ResponseEntity<RespuestaGenerica<List<RecursoUsuarioResponseDTO>>> obtenerRecursoUsuario(
                        @PathVariable Long apliId,
                        @PathVariable String usuarioRed) {

                logger.info(
                                "GET /aplicaciones/{}/recursos/usuario/{}",
                                apliId,
                                usuarioRed);

                List<RecursoUsuarioResponseDTO> recursos = recursosService.obtenerRecursoUsuario(
                                usuarioRed,
                                apliId);

                RespuestaGenerica<List<RecursoUsuarioResponseDTO>> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                recursos);

                return ResponseEntity.ok(respuesta);
        }

}