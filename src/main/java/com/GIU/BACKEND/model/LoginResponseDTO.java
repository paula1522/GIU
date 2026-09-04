package com.GIU.BACKEND.model;

import java.util.List;

import lombok.Data;

@Data
public class LoginResponseDTO {
    private UsuarioAplicacionDTO usuario;
    private boolean superAdmin;
    private List<RecursoDTO> permisos;
    
}
