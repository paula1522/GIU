package com.giu.model.gestionAplicaciones;

import java.time.LocalDateTime;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.giu.utils.FechaUtils;

import lombok.Data;

@Data
public class GestionarAdministradorRequest {

    @NotBlank(message = "El usuarioRed es obligatorio")
    private String usuarioRed;

    @NotNull(message = "El apliId es obligatorio")
    private Long apliId;
    private LocalDateTime fechaIn;
    private LocalDateTime fechaFin;

    @JsonIgnore
    @AssertTrue(message = "La fecha fin debe ser mayor a la fecha inicio")
    public boolean isRangoFechasValido() {
        return FechaUtils.fechaFinMayorInicio(fechaIn, fechaFin);
    }

}
