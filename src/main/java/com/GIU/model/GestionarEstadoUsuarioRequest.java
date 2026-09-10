package com.giu.model;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import lombok.Data;

@Data
@Valid 
public class GestionarEstadoUsuarioRequest {

    @NotNull(message = "El id de aplicación es obligatorio")
    private Long apliId;

    @NotBlank(message = "El usuario de red es obligatorio")
    private String UsuarioRed;

    @NotNull(message = "La operación es obligatoria")
    private Integer operacion;
}