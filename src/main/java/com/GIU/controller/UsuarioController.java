package com.giu.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giu.utils.RespuestaGenerica;
import com.giu.model.UsuarioRequestDTO;
import com.giu.service.GestionUsuariosService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final GestionUsuariosService usuarioService;

    public UsuarioController(GestionUsuariosService usuarioService) {
        this.usuarioService = usuarioService;
    }

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
    public ResponseEntity<RespuestaGenerica<List<UsuarioRequestDTO>>> obtenerUsuarios(
            @RequestParam(required = false) String usuarioRed,
            @RequestParam(required = false) String estado) {

        List<UsuarioRequestDTO> usuarios = usuarioService.obtenerUsuarios(
                usuarioRed,
                estado);

        RespuestaGenerica<List<UsuarioRequestDTO>> RespuestaGenerica =
                new RespuestaGenerica<>("0", "Proceso exitoso", usuarios);

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
     *   "usuarioRed": "uuu111",
     *   "nombre": "DANIEL MUÑOZ",
     *   "correo": "user@gmail.com",
     *   "numeroIdentificacion": "123456789",
     *   "usuarioModificacion": "uuu00"
     * }
     */
    @PostMapping
    public ResponseEntity<RespuestaGenerica<Void>> crearUsuario(
            @Valid @RequestBody UsuarioRequestDTO request) {

        usuarioService.crearUsuario(request);

        RespuestaGenerica<Void> RespuestaGenerica =
                new RespuestaGenerica<>("0", "Usuario creado correctamente", null);

        return ResponseEntity.ok(RespuestaGenerica);
    }

    /**
     * Modificar usuario
     *
     * Método: PUT
     * Ruta: /api/usuarios
     *
     * Ejemplo de cuerpo de la solicitud:
     * {
     *   "usuarioRed": "uuu111",
     *   "nombre": "DANIEL MUÑOZ",
     *   "correo": "user@gmail.com",
     *   "numeroIdentificacion": "123456789",
     *   "usuarioModificacion": "uuu00"
     * }
     */
    @PutMapping
    public ResponseEntity<RespuestaGenerica<Void>> modificarUsuario(
            @Valid @RequestBody UsuarioRequestDTO request) {

        usuarioService.modificarUsuario(request);

        RespuestaGenerica<Void> RespuestaGenerica =
                new RespuestaGenerica<>("0", "Usuario modificado correctamente", null);

        return ResponseEntity.ok(RespuestaGenerica);
    }
}