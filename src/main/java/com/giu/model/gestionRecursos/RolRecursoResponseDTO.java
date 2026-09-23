package com.giu.model.gestionRecursos;

import lombok.Data;

@Data 
public class RolRecursoResponseDTO {
    private Long id;
    private Long recuId;
    private Long rolId;
    private Long apliId;
    private String rolNombre;
    private String rolDescripcion;
    private String rolEstado;
}
