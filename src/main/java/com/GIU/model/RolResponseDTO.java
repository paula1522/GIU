package com.giu.model;

import java.time.LocalDateTime;


import lombok.Data;


@Data
public class RolResponseDTO {

    private Long id;
    private Long apliId;
    private String nombre;
    private String descripcion;
    private String estado;
    private LocalDateTime fechaCreacion;
    private String usuarioCreacion;
    private LocalDateTime fechaModificacion;
    private String usuarioModificacion;
}
