package com.giu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giu.model.LoginRequestDTO;
import com.giu.model.LoginResponseDTO;

@RestController
@RequestMapping("/auth")
public class AuthController {

    /**
     * Iniciar sesión
     *
     * Método: POST
     * Ruta: /auth/login
     *
     * Ejemplo:
     * POST /auth/login
     *
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> iniciarSesion(
            @RequestBody LoginRequestDTO request) {

        return ResponseEntity.ok().build();
    }
}