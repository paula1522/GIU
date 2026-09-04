package com.GIU.BACKEND.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UsuarioAplicacionDTO {
    private Long id;
    private String usuarioRed;
    private String nombre;
    private String correo;
    private String numeroIdentificacion;
    private String estadoUsua;
    private String esSuperAdmin;
    private LocalDateTime fechaCreacion;
    private String usuarioCreacion;
    private LocalDateTime fechaModificacion;
    private String usuarioModificacion;

    private String codigoApli;
    private String nombreApli;
    private String estadoApli;

    private Long idRol;
    private String nombreRol;
    private LocalDateTime fechaInRol;
    private LocalDateTime fechaFinRol;

}
