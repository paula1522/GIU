package com.giu.model.gestionUsuarios;

import java.time.LocalDateTime;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.giu.utils.FechaUtils;

import lombok.Data;

@Data
public class GestionarRolUsuarioRequestDTO {

    @NotNull(message = "El id de rol es obligatorio")
    private Long rolId;

    private String usuarioRed;
    private LocalDateTime fechaIn;
    private LocalDateTime fechaFin;

    @JsonIgnore
    @AssertTrue(message = "La fecha fin debe ser mayor a la fecha inicio")
    public boolean isRangoFechasValido() {
        return FechaUtils.fechaFinMayorInicio(fechaIn, fechaFin);
    }

}