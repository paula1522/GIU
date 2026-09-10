package com.giu.model;

import java.time.LocalDateTime;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import lombok.Data;

@Data
@Valid 
public class GestionarRolUsuarioRequest {

    @NotNull(message = "El id de rol es obligatorio")
    private Long rolId;

    @NotBlank(message = "El usuario de red es obligatorio")
    private String usuarioRed;

    private LocalDateTime fechaIn;
    private LocalDateTime fechaFin;

    @NotBlank(message = "El usuario que modifica es obligatorio")
    private String usuarioModificacion;
}