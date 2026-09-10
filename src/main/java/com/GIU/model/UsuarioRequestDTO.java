package com.giu.model;

import java.time.LocalDateTime;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
@Valid 
public class UsuarioRequestDTO {

    private Long id;

    @NotBlank(message = "El usuario de red es obligatorio")
    @Size(max = 20, message = "El usuario de red no puede superar 20 caracteres")
    private String usuarioRed;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
    private String nombre;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    @Size(max = 50, message = "El correo no puede superar 50 caracteres")
    private String correo;

    @Pattern(
        regexp = "ACTIVO|INACTIVO|BLOQUEADO",
        message = "El estado debe ser ACTIVO, INACTIVO o BLOQUEADO"
    )
    private String estado;

    @NotBlank(message = "El número de identificación es obligatorio")
    @Size(max = 50, message = "El número de identificación no puede superar 50 caracteres")
    private String numeroIdentificacion;

    @Pattern(
        regexp = "0|1",
        message = "El super administrador debe ser 0 o 1"
    )
    private String superAdministrador;

    private LocalDateTime fechaCreacion;

    private String usuarioCreacion;
    
    private LocalDateTime fechaModificacion;

    private String usuarioModificacion;
}