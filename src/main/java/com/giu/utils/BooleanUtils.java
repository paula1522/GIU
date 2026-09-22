package com.giu.utils;

public class BooleanUtils {

    // true = ACTIVO, false = INACTIVO
    public static String booleanToEstado(Boolean valor) {
        if (valor == null)
            return null;
        return valor ? Constantes.ESTADO_ACTIVO : Constantes.ESTADO_INACTIVO;
    }

    // true = PROPIA, false = PORTAL_CONFIGURACIONES
    public static String booleanToAdministracion(Boolean valor) {
        if (valor == null)
            return null;
        return valor ? "PROPIA" : "PORTAL_CONFIGURACIONES";
    }

    // true = 1, false = 0
    public static Integer booleanToSuperAdmin(Boolean valor) {
        if (valor == null)
            return null;
        return valor ? 1 : 0;
    }

    // true = 1, false = 0
    public static Integer booleanToVigente(Boolean valor) {
        if (valor == null)
            return Constantes.VIGENCIA_TODOS;
        return valor ? Constantes.VIGENCIA_ACTIVO : Constantes.VIGENCIA_TODOS;
    }
}
