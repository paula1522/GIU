package com.GIU.BACKEND.model;

import lombok.Data;

@Data
public class GestionarEstadoUsuarioRequest {
    private Long apliId; 
    private String usuaUsuarioRed; 
    private Integer operacion;
}
