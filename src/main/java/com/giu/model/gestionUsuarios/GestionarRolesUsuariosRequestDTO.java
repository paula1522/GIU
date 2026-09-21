package com.giu.model.gestionUsuarios;

import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;

import lombok.Data;

@Data
public class GestionarRolesUsuariosRequestDTO {

    @NotEmpty(message = "Debe indicar al menos un usuario")
    @Valid
    private List<UsuarioRolRequestDTO> usuariosRed;
}