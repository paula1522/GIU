package com.giu.model.gestionRoles;


import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class ModificarRolRequestDTO {


    @Size(max = 50, message = "El nombre del rol no puede superar los 50 caracteres")
    private String nombre;

    @Size(max = 200, message = "La descripción no puede superar los 200 caracteres")
    private String descripcion;

    private Boolean estado;
}
