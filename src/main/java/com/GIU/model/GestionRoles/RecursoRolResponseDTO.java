package com.giu.model.gestionRoles;


import lombok.Data;

@Data
public class RecursoRolResponseDTO {

    private Long id;
    private Long rolId;
    private Long recuId;
    private String recuCodigo;
    private String recuNombre;
    private String recuTipo;
    private String recuEstado;
}
