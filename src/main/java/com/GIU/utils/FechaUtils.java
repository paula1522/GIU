package com.giu.utils;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public class FechaUtils {
    
    // Convierte un objeto Timestamp a LocalDateTime, devolviendo null si el Timestamp es nulo
    public static LocalDateTime convertirFecha(Timestamp timestamp) {
        return timestamp != null
                ? timestamp.toLocalDateTime()
                : null;
    }

     // Valida que la fecha fin sea mayor a la fecha inicio
    public static boolean fechaFinMayorInicio(
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin) {

        if (fechaInicio == null || fechaFin == null) {
            return true;
        }

        return fechaFin.isAfter(fechaInicio);
    }
}
