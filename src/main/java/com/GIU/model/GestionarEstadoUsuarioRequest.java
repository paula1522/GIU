package com.giu.model;

import javax.validation.Valid;

import lombok.Data;

@Data
@Valid
public class GestionarEstadoUsuarioRequest {
    private Long apliId; 
    private String usuaUsuarioRed; 
    private Integer operacion;
}
