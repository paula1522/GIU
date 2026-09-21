package com.giu.model.gestionAplicaciones;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class ModificarAplicacionRequest {


    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;
    private String codigo;
    
    @Size(max = 200, message = "La descripción no puede superar los 200 caracteres")
    private String descripcion;

    // true = ACTIVO / false = INACTIVO
    private Boolean estado;

    // true = PROPIA / false = PORTAL_CONFIGURACIONES
    private Boolean administracion;
}
