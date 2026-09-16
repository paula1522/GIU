package com.giu.model.gestionAplicaciones;


import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AdministradorAplicacionResponseDTO {

    private Long id;
    private Long apliId;
    private LocalDateTime fechaIn;
    private LocalDateTime fechaFin;
    private LocalDateTime fechaCreacion;
    private String usuarioCreacion;
    private LocalDateTime fechaModificacion;
    private String usuarioModificacion;

    private Long usuarioId;
    private String usuarioRed;
    private String nombre;
    private String correo;
    private String numeroIdentificacion;
    private String estadoUsuario;
    private Integer esSuperAdmin;
    private LocalDateTime fechaCreacionUsuario;
    private String usuarioCreacionUsuario;
    private LocalDateTime fechaModificacionUsuario;
    private String usuarioModificacionUsuario;
}
