package com.giu.model.gestionRoles;


import java.util.List;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;

import lombok.Data;

@Data
public class CrearRolRequestDTO {


    @NotBlank(message = "El nombre del rol es obligatorio")
    private String nombre;
    private String descripcion;
    
    @NotEmpty
    private List<Long> recursos;

}
