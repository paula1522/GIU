package com.giu.model.gestionUsuarios;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import lombok.Data;

@Data
public class UsuarioRolRequestDTO {

    @NotBlank(message = "El usuario de red es obligatorio")
    private String usuarioRed;

    @NotNull(message = "El id de rol es obligatorio")
    private Long rolId;
}