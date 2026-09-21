package com.giu.model.gestionRoles;

import java.util.List;

import javax.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class GestionarRecursosRolRequestDTO {

    @NotEmpty
    private List<Long> recursos;

}
