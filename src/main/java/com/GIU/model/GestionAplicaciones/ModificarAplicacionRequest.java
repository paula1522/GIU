package com.giu.model.gestionAplicaciones;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class ModificarAplicacionRequest {


    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;
    private String codigo;
    
    @Size(max = 200, message = "La descripción no puede superar los 200 caracteres")
    private String descripcion;
    private String estado;
    private String administracion;
}
