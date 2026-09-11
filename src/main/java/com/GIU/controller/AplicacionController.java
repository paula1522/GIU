package com.giu.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giu.model.GestionarRolUsuarioRequest;
import com.giu.model.RolResponseDTO;
import com.giu.model.UsuarioAplicacionDTO;
import com.giu.model.UsuarioRolResponseDTO;
import com.giu.service.GestionRolesService;
import com.giu.service.GestionUsuariosService;
import com.giu.utils.RespuestaGenerica;
import com.giu.utils.TipoRespuesta;

@RestController
@RequestMapping("/api/aplicaciones/{apliId}")
public class AplicacionController {

    private final GestionUsuariosService usuarioService;
    private final GestionRolesService rolesService;

    public AplicacionController(
            GestionUsuariosService usuarioService,
            GestionRolesService rolesService) {

        this.usuarioService = usuarioService;
        this.rolesService = rolesService;
    }

    /**
     * Listar roles activos por aplicación
     *
     * Método: GET
     * Ruta: /api/aplicaciones/{apliId}/roles
     *
     * Ejemplo:
     * GET /api/aplicaciones/1/roles
     */
    @GetMapping("/roles")
    public ResponseEntity<RespuestaGenerica<List<RolResponseDTO>>> obtenerRoles(
            @PathVariable Long apliId) {

        List<RolResponseDTO> roles =
                rolesService.obtenerRoles(apliId);

        RespuestaGenerica<List<RolResponseDTO>> respuesta =
                new RespuestaGenerica<>(
                        TipoRespuesta.EXITOSO,
                        roles
                );

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Listar usuarios activos por aplicación
     *
     * Método: GET
     * Ruta: /api/aplicaciones/{apliId}/usuarios
     *
     * Ejemplo:
     * GET /api/aplicaciones/1/usuarios?estado=ACTIVO
     */
    @GetMapping("/usuarios")
    public ResponseEntity<RespuestaGenerica<List<UsuarioAplicacionDTO>>> obtenerUsuariosPorAplicacion(
            @PathVariable Long apliId,
            @RequestParam(required = false) String estado) {

        List<UsuarioAplicacionDTO> usuarios =
                usuarioService.obtenerUsuariosPorAplicacion(
                        apliId,
                        estado
                );

        RespuestaGenerica<List<UsuarioAplicacionDTO>> respuesta =
                new RespuestaGenerica<>(
                        TipoRespuesta.EXITOSO,
                        usuarios
                );

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Consultar rol de un usuario para una aplicación específica
     *
     * Método: GET
     * Ruta: /api/aplicaciones/{apliId}/rol/usuarios/{usuarioRed}
     *
     * Ejemplo:
     * GET /api/aplicaciones/1/rol/usuarios/UUU111
     */
    @GetMapping("/rol/usuarios/{usuarioRed}")
    public ResponseEntity<RespuestaGenerica<UsuarioRolResponseDTO>> obtenerRolUsuario(
            @PathVariable Long apliId,
            @PathVariable String usuarioRed) {

        UsuarioRolResponseDTO resultado =
                usuarioService.obtenerRolUsuario(
                        usuarioRed,
                        apliId
                );

        RespuestaGenerica<UsuarioRolResponseDTO> respuesta =
                new RespuestaGenerica<>(
                        TipoRespuesta.EXITOSO,
                        resultado
                );

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Asignar rol a un usuario para una aplicación específica
     *
     * Método: POST
     * Ruta: /api/aplicaciones/{apliId}/usuarios/asignacion-rol
     *
     * Ejemplo:
     * POST /api/aplicaciones/1/usuarios/asignacion-rol
     */
    @PostMapping("/usuarios/asignacion-rol")
    public ResponseEntity<RespuestaGenerica<Void>> gestionarRolUsuario(
            @PathVariable Long apliId,
            @Valid @RequestBody GestionarRolUsuarioRequest request) {

        usuarioService.gestionarRolUsuario(
                apliId,
                request
        );

        RespuestaGenerica<Void> respuesta =
                new RespuestaGenerica<>(
                        TipoRespuesta.EXITOSO,
                        null
                );

        return ResponseEntity.ok(respuesta);
    }
}

