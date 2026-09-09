package com.giu.model;

import java.time.LocalDateTime;

import javax.validation.Valid;

import lombok.Data;


@Data
@Valid

public class UsuarioRolResponseDTO {
    private String usuarioRed;
    private Long apliId;
    private Long rolId;
    private LocalDateTime fechaIn;
    private LocalDateTime fechaFin;
}
