package com.giu.model.gestionUsuarios;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UsuarioMasivoExcelDTO {

    private String usuarioRed;
    private String nombre;
    private String correo;
    private String identificacion;
    private Boolean superAdministrador;
    private Long rolId;
    private LocalDateTime fechaIn;
    private LocalDateTime fechaFin;
}