package com.giu.exception;

public class ErrorBaseDatosException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ErrorBaseDatosException(String mensaje) {
        super(mensaje);
    }

    public ErrorBaseDatosException(
            String mensaje,
            Throwable causa) {

        super(mensaje, causa);
    }
}
