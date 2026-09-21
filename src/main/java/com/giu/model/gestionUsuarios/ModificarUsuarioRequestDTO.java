package com.giu.model.gestionUsuarios;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class ModificarUsuarioRequestDTO {

    @NotBlank(message = "El usuario de red es obligatorio")
    @Size(max = 20, message = "El usuario de red no puede superar los 20 caracteres")
    private String usuarioRed;

    @Size(max = 50, message = "El nombre no puede superar los 50 caracteres")
    private String nombre;

    @Size(max = 50, message = "El correo no puede superar los 50 caracteres")
    private String correo;

    @Size(max = 50, message = "El número de identificación no puede superar los 50 caracteres")
    private String numeroIdentificacion;
    

    private Boolean superAdministrador;
}