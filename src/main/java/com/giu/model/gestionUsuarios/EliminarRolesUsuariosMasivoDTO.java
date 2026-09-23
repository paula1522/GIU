package com.giu.model.gestionUsuarios;

import lombok.Data;

@Data
public class EliminarRolesUsuariosMasivoDTO {

    private String usuarioRed;
    private Long rolId;
    private String operacion;
}