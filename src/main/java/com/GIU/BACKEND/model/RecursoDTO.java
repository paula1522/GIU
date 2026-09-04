package com.GIU.BACKEND.model;

import lombok.Data;

@Data
public class RecursoDTO {
    private int id; // Identificador único del recurso
    private int idPadre; // Identificador del recurso padre 
    private String codigo; // Código del recurso
    private String nombre; // Nombre del recurso
    private String descripcion; // Descripción del recurso
    private String tipo; // Tipo del recurso 
    private String apliNombre; // Nombre de la aplicación a la que pertenece el recurso

}
