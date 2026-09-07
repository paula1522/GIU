package com.GIU.BACKEND.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.GIU.BACKEND.model.UsuarioAplicacionDTO;
import com.GIU.BACKEND.service.UsuarioService;


@RestController
@RequestMapping("/api/aplicaciones")
public class AplicacionController {

    private final UsuarioService usuarioService;

    public AplicacionController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }


    /**
     * Listar usuarios activos por aplicación
     *
     * Método: GET
     * Ruta: /api/aplicaciones/{apliId}/usuarios
     *
     * Ejemplo:
     * GET /api/aplicaciones/1/usuarios?estado=ACTIVO
     *
     */
    @GetMapping("/{apliId}/usuarios")
    public ResponseEntity<List<UsuarioAplicacionDTO>>
            obtenerUsuariosPorAplicacion(
                    @PathVariable Long apliId,
                    @RequestParam(required = false)
                    String estado) {

        List<UsuarioAplicacionDTO> usuarios =
                usuarioService.obtenerUsuariosPorAplicacion(
                        apliId,
                        estado);

        return ResponseEntity.ok(usuarios);
    }

}
