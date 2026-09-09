package com.giu.model;

import java.time.LocalDateTime;

import javax.validation.Valid;

import lombok.Data;

@Data
@Valid
public class GestionarRolUsuarioRequest {
    private Long rolId; 
    private String usuarioRed; 
    private LocalDateTime fechaIn; 
    private LocalDateTime fechaFin; 
    private String usuarioModificacion;
}
