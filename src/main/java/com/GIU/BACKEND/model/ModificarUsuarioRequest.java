package com.GIU.BACKEND.model;

import lombok.Data;

@Data
public class ModificarUsuarioRequest {
    private String usuarioRed; 
    private String nombre; 
    private String correo; 
    private String numeroIdentificacion; 
    private Integer superAdministrador; 
    private String usuarioModificacion;
}
