package com.giu.model.gestionSeguridad;

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
    private String usuarioRed;

    @NotNull(message = "La operación es obligatoria")
    private Integer operacion;

    @NotNull(message = "El id del rol es obligatorio")
    private Long rolId; 


}