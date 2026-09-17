package com.giu.controller;

import java.util.List;

import javax.validation.Valid;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giu.model.RespuestaGenerica;
import com.giu.utils.TipoRespuesta;
import com.giu.model.gestionSeguridad.GestionarEstadoUsuarioRequest;
import com.giu.model.gestionUsuarios.CrearUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.ModificarUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.UsuarioResponseDTO;
import com.giu.service.GestionSeguridadService;
import com.giu.service.GestionUsuariosService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

        private static final Logger logger = LogManager.getLogger(UsuarioController.class);

        private final GestionUsuariosService usuarioService;
        private final GestionSeguridadService gestionSeguridadService;

        public UsuarioController(GestionUsuariosService usuarioService,
                        GestionSeguridadService gestionSeguridadService) {
                this.usuarioService = usuarioService;
                this.gestionSeguridadService = gestionSeguridadService;
        }

        /* GESTION DE USUARIOS */

        /**
         * Consultar usuarios
         *
         * Método: GET
         * Ruta: /api/usuarios
         *
         * Ejemplo ruta con filtros:
         * /api/usuarios?usuarioRed=UUU111&estado=Activo
         */
        @GetMapping
        public ResponseEntity<RespuestaGenerica<List<UsuarioResponseDTO>>> obtenerUsuarios(
                        @RequestParam(required = false) String usuarioRed,
                        @RequestParam(required = false) String estado) {

                logger.info("GET /usuarios - usuarioRed={}, estado={}", usuarioRed, estado);

                List<UsuarioResponseDTO> usuarios = usuarioService.obtenerUsuarios(
                                usuarioRed,
                                estado);

                RespuestaGenerica<List<UsuarioResponseDTO>> RespuestaGenerica = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO, usuarios);

                return ResponseEntity.ok(RespuestaGenerica);
        }

        /**
         * Crear usuario
         *
         * Método: POST
         * Ruta: /api/usuarios
         *
         * Ejemplo de cuerpo de la solicitud:
         * {
         * "usuarioRed": "uuu111",
         * "nombre": "DANIEL MUÑOZ",
         * "correo": "user@gmail.com",
         * "numeroIdentificacion": "123456789",
         * "usuarioModificacion": "uuu00"
         * }
         */
        @PostMapping
        public ResponseEntity<RespuestaGenerica<UsuarioResponseDTO>> crearUsuario(
                        @RequestHeader("usuarioCreacion") String usuarioCreacion,
                        @Valid @RequestBody CrearUsuarioRequestDTO request) {

                logger.info("POST /usuarios - usuarioRed={}", request.getUsuarioRed());

                UsuarioResponseDTO usuario = usuarioService.crearUsuario(request, usuarioCreacion);

                RespuestaGenerica<UsuarioResponseDTO> respuesta = new RespuestaGenerica<>(TipoRespuesta.EXITOSO,
                                usuario);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Modificar usuario
         *
         * Método: PUT
         * Ruta: /api/usuarios
         *
         * Ejemplo de cuerpo de la solicitud:
         * { id : 1, falta
         * "usuarioRed": "uuu111",
         * "nombre": "DANIEL MUÑOZ",
         * "correo": "user@gmail.com",
         * "numeroIdentificacion": "123456789",
         * "usuarioModificacion": "uuu00"
         * }
         */
        @PutMapping
        public ResponseEntity<RespuestaGenerica<UsuarioResponseDTO>> modificarUsuario(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @Valid @RequestBody ModificarUsuarioRequestDTO request) {

                logger.info("PUT /usuarios - usuarioRed={}", request.getUsuarioRed());

                UsuarioResponseDTO usuario = usuarioService.modificarUsuario(request, usuarioModificacion);

                RespuestaGenerica<UsuarioResponseDTO> respuesta = new RespuestaGenerica<>(TipoRespuesta.EXITOSO,
                                usuario);

                return ResponseEntity.ok(respuesta);
        }

        /* GESTION DE SEGURIDAD */

        /***
         * Gestionar estado de usuario
         * 
         * Método: PUT
         * Ruta: /api/usuarios/gestionar-estado
         * 
         * Ejemplo de cuerpo de la solicitud:
         * {
         * "apliId": 1,
         * "usuarioRed": "uuu111",
         * "operacion": 1, /0 = Activar Y 2 = Desactivar/
         * "rolId": "ROL123",
         * "usuarioModificacion": "uuu111"
         * * }
         */

        @PutMapping("/gestionar-estado")
        public ResponseEntity<RespuestaGenerica<List<String>>> gestionarEstadoUsuario(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @Valid @RequestBody GestionarEstadoUsuarioRequest request) {

                logger.info("PUT /usuarios/gestionar-estado - usuarioRed={}, operacion={}",
                                request.getUsuarioRed(), request.getOperacion());

                gestionSeguridadService.gestionarEstadoUsuario(request, usuarioModificacion);

                RespuestaGenerica<List<String>> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                null);

                return ResponseEntity.ok(respuesta);
        }
}