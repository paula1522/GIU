package com.giu.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giu.model.gestionRoles.RolResponseDTO;
import com.giu.model.gestionUsuarios.GestionarRolUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.GestionarRolesUsuariosRequestDTO;
import com.giu.model.gestionUsuarios.UsuarioRolResponseDTO;
import com.giu.service.GestionAplicacionesService;
import com.giu.service.GestionRolesService;
import com.giu.service.GestionUsuariosService;
import com.giu.model.RespuestaGenerica;
import com.giu.utils.TipoRespuesta;

@RestController
@RequestMapping("/api/aplicaciones/{apliId}")
public class UsuarioAplicacionController {

        private final GestionUsuariosService usuarioService;
        private final GestionRolesService rolesService;

        public UsuarioAplicacionController(
                        GestionUsuariosService usuarioService,
                        GestionAplicacionesService aplicacionesService,
                        GestionRolesService rolesService) {

                this.usuarioService = usuarioService;
                this.rolesService = rolesService;
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
        @GetMapping("/rol/usuarios/{usuarioRed}")
        public ResponseEntity<RespuestaGenerica<UsuarioRolResponseDTO>> obtenerRolUsuario(
                        @PathVariable Long apliId,
                        @PathVariable String usuarioRed) {

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
        @PostMapping("/usuarios/asignacion-rol")
        public ResponseEntity<RespuestaGenerica<Void>> asignarRolUsuario(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @PathVariable Long apliId,
                        @Valid @RequestBody GestionarRolUsuarioRequestDTO request) {

                

                usuarioService.asignarRolUsuario(
                                apliId,
                                request,
                                usuarioModificacion);

                RespuestaGenerica<Void> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                null);

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
        @DeleteMapping("/usuarios/{usuarioRed}")
        public ResponseEntity<RespuestaGenerica<Void>> retirarRolUsuario(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @PathVariable Long apliId,
                        @PathVariable String usuarioRed,
                        @Valid @RequestBody GestionarRolUsuarioRequestDTO request) {

                

                request.setUsuarioRed(usuarioRed);

                usuarioService.retirarRolUsuario(
                                apliId,
                                request,
                                usuarioModificacion);

                RespuestaGenerica<Void> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                null);

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
        @DeleteMapping("/usuario")
        public ResponseEntity<RespuestaGenerica<Void>> retirarRolesUsuarios(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @PathVariable Long apliId,
                        @Valid @RequestBody GestionarRolesUsuariosRequestDTO request) {


                usuarioService.retirarRolesUsuarios(apliId, request, usuarioModificacion);

                RespuestaGenerica<Void> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                null);

                return ResponseEntity.ok(respuesta);
        }

}
