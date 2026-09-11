package com.giu.exception;

import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.giu.utils.RespuestaGenerica;
import com.giu.utils.TipoRespuesta;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Maneja errores de validación de los datos recibidos
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RespuestaGenerica<Void>> manejarValidacion(
            MethodArgumentNotValidException ex) {

        String detalle =
                ex.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .map(error ->
                                error.getField()
                                        + ": "
                                        + error.getDefaultMessage())
                        .collect(Collectors.joining("; "));

        log.warn(
                "Error de validación: {}",
                detalle);

        RespuestaGenerica<Void> respuesta =
                new RespuestaGenerica<>(
                        TipoRespuesta.DATOS_INVALIDOS,
                        null);

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Maneja errores cuando el JSON recibido no tiene el formato esperado
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<RespuestaGenerica<Void>> manejarBodyInvalido(
            HttpMessageNotReadableException ex) {

        log.warn(
                "Body no legible: {}",
                ex.getMessage());

        RespuestaGenerica<Void> respuesta =
                new RespuestaGenerica<>(
                        TipoRespuesta.JSON_INVALIDO,
                        null);

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Maneja errores de operación generados desde el Repository.
     */
    @ExceptionHandler(ErrorOperacionException.class)
    public ResponseEntity<RespuestaGenerica<Void>> manejarErrorOperacion(
            ErrorOperacionException ex) {

        log.warn(
                "Operación no realizada: {}",
                ex.getMessage());

        RespuestaGenerica<Void> respuesta =
                new RespuestaGenerica<>(
                        ex.getTipoRespuesta(),
                        null);

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Maneja errores técnicos relacionados
     * con la Base de Datos.
     */
    @ExceptionHandler(ErrorBaseDatosException.class)
    public ResponseEntity<RespuestaGenerica<Void>> manejarErrorBaseDatos(
            ErrorBaseDatosException ex) {

        log.error(
                "Error de Base de Datos",
                ex);

        RespuestaGenerica<Void> respuesta =
                new RespuestaGenerica<>(
                        TipoRespuesta.ERROR_BD,
                        null);

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Maneja cualquier error inesperado
     * que no haya sido contemplado anteriormente.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<RespuestaGenerica<Void>> manejarErrorInterno(
            Exception ex) {

        log.error(
                "Error no controlado",
                ex);

        RespuestaGenerica<Void> respuesta =
                new RespuestaGenerica<>(
                        TipoRespuesta.ERROR_INESPERADO,
                        null);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(respuesta);
    }
}
