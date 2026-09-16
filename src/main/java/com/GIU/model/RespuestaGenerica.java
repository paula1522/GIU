package com.giu.model;

import com.giu.utils.TipoRespuesta;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RespuestaGenerica<T> {

    private String codigoRespuesta;
    private String descripcionRespuesta;
    private T data;

    public RespuestaGenerica(
            TipoRespuesta tipoRespuesta,
            T data) {

        this.codigoRespuesta = tipoRespuesta.getCodigo();
        this.descripcionRespuesta = tipoRespuesta.getDescripcion();
        this.data = data;
    }
}