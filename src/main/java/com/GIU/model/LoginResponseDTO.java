package com.giu.model;

import java.util.List;

import javax.validation.Valid;

import com.giu.model.gestionRecursos.RecursoDTO;
import com.giu.model.gestionUsuarios.UsuarioAplicacionResponseDTO;

import lombok.Data;

@Data
@Valid
public class LoginResponseDTO {
    private UsuarioAplicacionResponseDTO usuario;
    private boolean superAdmin;
    private List<RecursoDTO> permisos;
    
}
