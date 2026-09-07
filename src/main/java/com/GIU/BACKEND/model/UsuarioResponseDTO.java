package com.GIU.BACKEND.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data 
public class UsuarioResponseDTO {
    private Long id;
    private String usuarioRed;
    private String nombre;
    private String correo;
    private String estado;
    private String numeroIdentificacion;
    private String superAdministrador;
    private LocalDateTime fechaCreacion;
    private String usuarioCreacion;
    private LocalDateTime fechaModificacion;
    private String usuarioModificacion;
}
