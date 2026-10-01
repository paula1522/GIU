package com.giu.model.gestionUsuarios;

import java.util.List;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;

import lombok.Data;

@Data
public class RetirarRolesUsuariosRequestDTO {


    @NotEmpty(message = "Debe indicar al menos un usuario")
    private List<@NotNull @Positive Long> usuariosIds;

}