package com.GIU.BACKEND.model;

import java.time.LocalDateTime;

import lombok.Data;


@Data

public class UsuarioRolResponseDTO {
    private String usuarioRed;
    private Long apliId;
    private Long rolId;
    private LocalDateTime fechaIn;
    private LocalDateTime fechaFin;
}
