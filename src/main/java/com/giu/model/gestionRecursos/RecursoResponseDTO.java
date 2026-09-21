package com.giu.model.gestionRecursos;

import lombok.Data;

@Data
public class RecursoResponseDTO {

    private Long id;
    private Long apliId;
    private Long recuIdPadre;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String tipo;
    private String estado;
}