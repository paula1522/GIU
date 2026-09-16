package com.giu.model.gestionUsuarios;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class CrearUsuarioRequestDTO {

    @NotBlank(message = "El usuario de red es obligatorio")
    @Size(max = 20, message = "El usuario de red no puede superar los 20 caracteres")
    private String usuarioRed;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El nombre no puede superar los 50 caracteres")
    private String nombre;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo electrónico no es válido")
    @Size(max = 50, message = "El correo no puede superar los 50 caracteres")
    private String correo;

    @NotBlank(message = "El número de identificación es obligatorio")
    @Size(max = 50, message = "El número de identificación no puede superar los 50 caracteres")
    private String numeroIdentificacion;

    private Integer superAdministrador;
}