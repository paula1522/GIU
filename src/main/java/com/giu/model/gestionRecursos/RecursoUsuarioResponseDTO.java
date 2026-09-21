package com.giu.model.gestionRecursos;

import lombok.Data;

@Data
public class RecursoUsuarioResponseDTO {

    private Long id;
    private Long recuIdPadre;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String tipo;
    private String apliNombre;
}
