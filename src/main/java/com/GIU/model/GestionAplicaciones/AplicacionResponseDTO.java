package com.giu.model.gestionAplicaciones;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AplicacionResponseDTO {

    private Long id;
    private String nombre;
    private String codigo;
    private String descripcion;
    private String estado;
    private String administracion;
    private LocalDateTime fechaCreacion;
    private String usuarioCreacion;
    private LocalDateTime fechaModificacion;
    private String usuarioModificacion;
}

