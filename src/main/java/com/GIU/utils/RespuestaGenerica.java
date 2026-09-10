package com.giu.utils;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data

@NoArgsConstructor
@AllArgsConstructor
public class RespuestaGenerica<T> {
    private String codigoRespuesta;
    private String descripcionRespuesta;
    private T data;

    
}
