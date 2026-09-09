package com.giu.model;

import java.util.List;

import javax.validation.Valid;

import lombok.Data;

@Data
@Valid
public class LoginResponseDTO {
    private UsuarioAplicacionDTO usuario;
    private boolean superAdmin;
    private List<RecursoDTO> permisos;
    
}
