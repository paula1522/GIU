package com.giu.utils;

public enum TipoRespuesta {

    EXITOSO(
            "0",
            "Proceso exitoso"),

    DATOS_INVALIDOS(
            "1002",
            "Los datos de entrada son inválidos"),

    ERROR(
            "1001",
            "Error en el proceso"); 

    private final String codigo;
    private final String descripcion;

    TipoRespuesta(
            String codigo,
            String descripcion) {

        this.codigo = codigo;
        this.descripcion = descripcion;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }
}