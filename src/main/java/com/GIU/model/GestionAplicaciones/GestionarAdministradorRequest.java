package com.giu.model.gestionAplicaciones;

import java.time.LocalDateTime;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import lombok.Data;

@Data
public class GestionarAdministradorRequest {

    @NotBlank(message = "El usuarioRed es obligatorio")
    private String usuarioRed;

    @NotNull(message = "El apliId es obligatorio")
    private Long apliId;
    private LocalDateTime fechaIn;
    private LocalDateTime fechaFin;

}
