package com.giu.model.gestionUsuarios;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class AplicacionRolUsuarioDTO {
    private String nombreApli;
    private Long rolId;
    private String nombreRol;
    private LocalDateTime fechaInRol;
    private LocalDateTime fechaFinRol;
    private String estadoApli;
    private Boolean esAdminApli;
}