package com.giu.model;


import lombok.Data;

@Data
public class RecursoDTO {
    private int id; 
    private int idPadre; 
    private String codigo; 
    private String nombre; 
    private String descripcion; 
    private String tipo; 
    private String apliNombre;

}
