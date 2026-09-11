package com.giu.utils;

public enum TipoRespuesta {

    EXITOSO(
            "0",
            "Proceso exitoso"),

    NO_ENCONTRADO(
            "1001",
            "El recurso solicitado no fue encontrado"),

    DATOS_INVALIDOS(
            "1002",
            "Los datos de entrada no son válidos"),

    JSON_INVALIDO(
            "1003",
            "El cuerpo de la petición no tiene el formato esperado"),

    YA_EXISTE(
            "1004",
            "El recurso indicado ya existe"),

    OPERACION_NO_REALIZADA(
            "1005",
            "No fue posible realizar la operación solicitada"),

    ERROR_BD(
            "2001",
            "No fue posible realizar la operación en la Base de Datos"),

    ERROR_INESPERADO(
            "9999",
            "Ocurrió un error inesperado en el sistema");

    private final String codigo;
    private final String mensaje;

    TipoRespuesta(
            String codigo,
            String mensaje) {

        this.codigo = codigo;
        this.mensaje = mensaje;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getMensaje() {
        return mensaje;
    }
}