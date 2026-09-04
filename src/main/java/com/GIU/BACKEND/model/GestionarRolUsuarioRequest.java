package com.GIU.BACKEND.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GestionarRolUsuarioRequest {
    private Long apliId; 
    private Long rolId; 
    private String usuaUsuarioRed; 
    private Integer operacion; 
    private LocalDateTime fechaIn; 
    private LocalDateTime fechaFin; 
    private String usuarioModificacion;
}
