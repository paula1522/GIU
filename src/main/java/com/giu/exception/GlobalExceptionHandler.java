package com.giu.exception;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.giu.model.RespuestaGenerica;
import com.giu.utils.TipoRespuesta;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RespuestaGenerica<Object>> manejarValidaciones(
            MethodArgumentNotValidException exception) {

        List<String> errores = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());

        RespuestaGenerica<Object> respuesta = new RespuestaGenerica<>(
                TipoRespuesta.DATOS_INVALIDOS,errores);

        return ResponseEntity.ok(respuesta);
    }
}
