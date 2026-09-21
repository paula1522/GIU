package com.giu.model.gestionRoles;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data 
public class DetalleRolResponseDTO {
    private Long id;
    private Long apliId;
    private String nombre;
    private String descripcion;
    private String estado;
    private LocalDateTime fechaCreacion;
    private String usuarioCreacion;
    private LocalDateTime fechaModificacion;
    private String usuarioModificacion;
    private List<RecursosRolResponseDTO> recursos;
}
