package com.giu.exception;

import com.giu.utils.TipoRespuesta;

public class ErrorOperacionException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final TipoRespuesta tipoRespuesta;

    public ErrorOperacionException(
            TipoRespuesta tipoRespuesta,
            String mensaje) {

        super(mensaje);

        this.tipoRespuesta = tipoRespuesta;
    }

    public TipoRespuesta getTipoRespuesta() {
        return tipoRespuesta;
    }
}