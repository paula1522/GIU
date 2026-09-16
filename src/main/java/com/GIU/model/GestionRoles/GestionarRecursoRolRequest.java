package com.giu.model.gestionRoles;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

import lombok.Data;

@Data
public class GestionarRecursoRolRequest {

    @NotNull(message = "El recurso es obligatorio")
    private Long recuId;

    @NotNull(message = "El rol es obligatorio")
    private Long rolId;



}
