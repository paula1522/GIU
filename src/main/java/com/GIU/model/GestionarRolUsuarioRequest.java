package com.giu.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GestionarRolUsuarioRequest {
    private Long rolId; 
    private String usuarioRed; 
    private LocalDateTime fechaIn; 
    private LocalDateTime fechaFin; 
    private String usuarioModificacion;
}
