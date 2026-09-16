package com.giu.model.gestionRoles;


import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class ModificarRolRequest {

    @NotNull(message = "El id del rol es obligatorio")
    private Long id;

    @NotNull(message = "La aplicación es obligatoria")
    private Long apliId;

    @Size(max = 50, message = "El nombre del rol no puede superar los 50 caracteres")
    private String nombre;

    @Size(max = 200, message = "La descripción no puede superar los 200 caracteres")
    private String descripcion;

    private String estado;
}
