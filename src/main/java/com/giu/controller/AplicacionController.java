package com.giu.controller;

import java.util.List;

import javax.validation.Valid;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giu.model.gestionAplicaciones.AdministradorAplicacionResponseDTO;
import com.giu.model.gestionAplicaciones.AplicacionResponseDTO;
import com.giu.model.gestionAplicaciones.CrearAplicacionRequest;
import com.giu.model.gestionAplicaciones.GestionarAdministradorRequest;
import com.giu.model.gestionAplicaciones.ModificarAplicacionRequest;
import com.giu.service.GestionAplicacionesService;
import com.giu.model.RespuestaGenerica;
import com.giu.utils.TipoRespuesta;

@RestController
@RequestMapping("/api/aplicaciones")
public class AplicacionController {

        private static final Logger logger = LogManager.getLogger(AplicacionController.class);

        private final GestionAplicacionesService aplicacionesService;

        public AplicacionController(
                        GestionAplicacionesService aplicacionesService) {

                this.aplicacionesService = aplicacionesService;
        }

        /* GESTIONAR APLICACIONES  */

        /**
         * Consultar aplicación
         *
         * Método: GET
         * Ruta: /api/aplicaciones
         *
         * Ejemplo:
         * GET /api/aplicaciones?codigo=GIU&estado=ACTIVO&nombre=APP
         */
        @GetMapping
        public ResponseEntity<RespuestaGenerica<List<AplicacionResponseDTO>>> obtenerAplicacion(
                        @RequestParam(required = false) String codigo,
                        @RequestParam(required = false) String estado,
                        @RequestParam(required = false) String nombre) {

                logger.info("GET /aplicaciones - codigo={}, estado={}, nombre={}", codigo, estado, nombre);

                List<AplicacionResponseDTO> aplicaciones = aplicacionesService.obtenerAplicacion(
                                codigo,
                                estado,
                                nombre);

                RespuestaGenerica<List<AplicacionResponseDTO>> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                aplicaciones);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Crear aplicación
         *
         * Método: POST
         * Ruta: /api/aplicaciones
         * 
         * Ejemplo de cuerpo de la solicitud:
         * 
         * {
         * "nombre": "Prueba",
         * "codigo": "PPP1115",
         * "descripcion": null,
         * "estado": "INACTIVO",
         * "administracion": "PROPIA"
         * }
         */
        @PostMapping
        public ResponseEntity<RespuestaGenerica<AplicacionResponseDTO>> crearAplicacion(
                        @RequestHeader("usuarioCreacion") String usuarioCreacion,
                        @Valid @RequestBody CrearAplicacionRequest request) {

                logger.info("POST /aplicaciones - codigo={}", request.getCodigo());

                AplicacionResponseDTO aplicacion = aplicacionesService.crearAplicacion(
                                request,
                                usuarioCreacion);

                RespuestaGenerica<AplicacionResponseDTO> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                aplicacion);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Modificar aplicación
         *
         * Método: PUT
         * Ruta: /api/aplicaciones/{id}
         * 
         * Ejemplo de cuerpo de la solicitud:
         * 
         * {
         * "nombre": "Prueba",
         * "codigo": "PPP1115",
         * "descripcion": null,
         * "estado": "INACTIVO",
         * "administracion": "PROPIA"
         * }
         */
        @PutMapping("/{id}")
        public ResponseEntity<RespuestaGenerica<AplicacionResponseDTO>> modificarAplicacion(
                        @PathVariable Long id,
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @Valid @RequestBody ModificarAplicacionRequest request) {

                logger.info("PUT /aplicaciones/{}", id);

                AplicacionResponseDTO aplicacion = aplicacionesService.modificarAplicacion(
                                id,
                                request,
                                usuarioModificacion);

                RespuestaGenerica<AplicacionResponseDTO> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                aplicacion);

                return ResponseEntity.ok(respuesta);
        }


        /* GESTIONAR ASIGNACION DE ADMINISTRADORES */

        /**
         * Consultar administradores de una aplicación
         *
         * Método: GET
         * Ruta: /api/aplicaciones/administradores
         * 
         * 
         */
        @GetMapping("/administradores")
        public ResponseEntity<RespuestaGenerica<List<AdministradorAplicacionResponseDTO>>> obtenerAdministradorAplicacion(
                        @RequestParam(required = false) String usuarioRed,
                        @RequestParam(required = false) Long apliId) {

                logger.info("GET /aplicaciones/administradores - usuarioRed={}, apliId={}", usuarioRed, apliId);

                List<AdministradorAplicacionResponseDTO> administradores = aplicacionesService
                                .obtenerAdministradorAplicacion(
                                                usuarioRed,
                                                apliId);

                RespuestaGenerica<List<AdministradorAplicacionResponseDTO>> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                administradores);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Gestionar administrador de una aplicación
         *
         * Método: POST
         * Ruta: /api/aplicaciones/administradores
         * 
         * Ejemplo de cuerpo de la solicitud:
         * 
         * {
         * "usuarioRed": "uuu111",
         * "apliId": 1
         * }
         */
        @PostMapping("/administradores")
        public ResponseEntity<RespuestaGenerica<AdministradorAplicacionResponseDTO>> crearAdministrador(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @Valid @RequestBody GestionarAdministradorRequest request) {

                logger.info("POST /aplicaciones/administradores - usuarioRed={}, apliId={}",
                                request.getUsuarioRed(), request.getApliId());

                AdministradorAplicacionResponseDTO administrador = aplicacionesService.crearAdministrador(
                                request,
                                usuarioModificacion);

                RespuestaGenerica<AdministradorAplicacionResponseDTO> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                administrador);

                return ResponseEntity.ok(respuesta);
        }

        /**
         * Gestionar administrador de una aplicación
         *
         * Método: DELETE
         * Ruta: /api/aplicaciones/administradores
         * 
         * Ejemplo de cuerpo de la solicitud:
         * 
         * {
         * "usuarioRed": "uuu111",
         * "apliId": 1
         * }
         * 
         */
        @PutMapping("/administradores")
        public ResponseEntity<RespuestaGenerica<AdministradorAplicacionResponseDTO>> retirarAdministrador(
                        @RequestHeader("usuarioModificacion") String usuarioModificacion,
                        @Valid @RequestBody GestionarAdministradorRequest request) {

                logger.info("PUT /aplicaciones/administradores - usuarioRed={}, apliId={}",
                                request.getUsuarioRed(), request.getApliId());

                AdministradorAplicacionResponseDTO administrador = aplicacionesService.retirarAdministrador(
                                request,
                                usuarioModificacion);

                RespuestaGenerica<AdministradorAplicacionResponseDTO> respuesta = new RespuestaGenerica<>(
                                TipoRespuesta.EXITOSO,
                                administrador);

                return ResponseEntity.ok(respuesta);
        }
}