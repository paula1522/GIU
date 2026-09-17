package com.giu.exception;

import java.util.List;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.giu.model.RespuestaGenerica;
import com.giu.utils.TipoRespuesta;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LogManager.getLogger(GlobalExceptionHandler.class);

    // Errores de validación de los DTO (@NotNull, @NotBlank, @Size, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RespuestaGenerica<Object>> manejarValidaciones(
            MethodArgumentNotValidException exception) {

        List<String> errores = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());

        logger.warn("Errores de validación: {}", errores);

        RespuestaGenerica<Object> respuesta = new RespuestaGenerica<>(
                TipoRespuesta.DATOS_INVALIDOS,
                errores);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    // Errores de negocio lanzados desde los PL
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<RespuestaGenerica<Void>> handleRuntime(RuntimeException e) {

        logger.warn("Error de negocio: {}", e.getMessage());

        RespuestaGenerica<Void> respuesta = new RespuestaGenerica<>(
                TipoRespuesta.ERROR,
                null);
        respuesta.setDescripcionRespuesta(e.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }
}