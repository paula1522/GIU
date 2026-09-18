package com.giu.model.gestionRecursos;

import javax.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class CrearRecursoRequestDTO {


    private Long recuIdPadre;
    @NotBlank
    private String codigo;
    @NotBlank
    private String nombre;
    private String descripcion;
    @NotBlank
    private String tipo;
}