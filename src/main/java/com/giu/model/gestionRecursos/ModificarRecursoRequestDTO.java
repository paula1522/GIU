package com.giu.model.gestionRecursos;


import lombok.Data;

@Data
public class ModificarRecursoRequestDTO {
  
    private Long recuIdPadre;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String tipo;
    private String estado;
}