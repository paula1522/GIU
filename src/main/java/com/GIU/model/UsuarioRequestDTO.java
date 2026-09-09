package com.giu.model;

import java.time.LocalDateTime;

import javax.validation.Valid;

import lombok.Data;

@Data
@Valid
public class UsuarioRequestDTO {
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
