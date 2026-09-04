package com.GIU.BACKEND.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.GIU.BACKEND.model.CrearUsuarioRequest;
import com.GIU.BACKEND.model.GestionarEstadoUsuarioRequest;
import com.GIU.BACKEND.model.ModificarUsuarioRequest;

@RestController
@RequestMapping("/api/usuarios")
public class UserController {

    /**
     * Consultar usuarios 
     *
     * Método: GET
     * Ruta: /api/usuarios
     * 
     * Ejemplo ruta con filtros:
     * /api/usuarios?usuarioRed=Juan&estado=Activo
     *
     */
    @GetMapping
    public ResponseEntity<?> listarUsuariosActivos() {
        return ResponseEntity.ok().build();
    }


    /**
     * Crear usuario
     *
     * Método: POST
     * Ruta: /api/usuarios
     *
     */
    @PostMapping
    public ResponseEntity<?> crearUsuario(
            @RequestBody CrearUsuarioRequest request) {

        return ResponseEntity.ok().build();
    }


    /**
     * Modificar usuario
     *
     * Método: PUT
     * Ruta: /api/usuarios
     *
     */
    @PutMapping
    public ResponseEntity<?> modificarUsuario(
            @RequestBody ModificarUsuarioRequest request) {

        return ResponseEntity.ok().build();
    }


   


    /**
     * Gestionar estado del usuario
     *
     * Método: PUT
     * Ruta: /api/usuarios/gestionar-estado
     *
     * Ejemplo:
     * PUT /api/usuarios/gestionar-estado
     *
     */
    @PutMapping("/gestionar-estado")
    public ResponseEntity<?> gestionarEstadoUsuario(
            @RequestBody GestionarEstadoUsuarioRequest request) {

        return ResponseEntity.ok().build();
    }
}

