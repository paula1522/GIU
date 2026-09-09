package com.giu.controller;

import java.util.List;

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


@RestController
@RequestMapping("/api/aplicaciones/{apliId}")
public class AplicacionController {

    private final GestionUsuariosService usuarioService;
    private final GestionRolesService rolesService;

    public AplicacionController(GestionUsuariosService usuarioService, GestionRolesService rolesService) {
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
     *
     */ 
    @GetMapping("/roles")
    public ResponseEntity<List<RolResponseDTO>> obtenerRoles(
            @PathVariable Long apliId) {

        return ResponseEntity.ok(
                rolesService.obtenerRoles(apliId));
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
    @GetMapping("/usuarios")
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


    /**
     * 
     * Consultar rol de un usuario para una aplicación específica
     * 
     * Método: GET
     * Ruta: /api/usuarios/aplicaciones/{apliId}/rol/usuarios/{usuarioRed}
     * 
     * Ejemplo ruta con filtros:
     * /api/usuarios/aplicaciones/1/rol/usuarios/UUU111
     */
    @GetMapping("/rol/usuarios/{usuarioRed}")
    public ResponseEntity<UsuarioRolResponseDTO> obtenerRolUsuario(
            @PathVariable Long apliId,
            @PathVariable String usuarioRed) {

        UsuarioRolResponseDTO resultado = usuarioService.obtenerRolUsuario(
                usuarioRed,
                apliId);

        return ResponseEntity.ok(resultado);
    }


    /**
     * Asignar rol a un usuario para una aplicación específica
     *
     * Método: POST
     * Ruta: /api/aplicaciones/{apliId}/usuarios/asignacion-rol
     *
     * Ejemplo:
     * POST /api/aplicaciones/1/usuarios/asignacion-rol
     * {
     *   "usuarioRed": "UUU111",
     *   "rolId": 1,
     *  "fechaIn": "2024-01-01T00:00:00",
     *  "fechaFin": "2024-12-31T23:59:59",
     * }
     */
    @PostMapping("/usuarios/asignacion-rol")
public ResponseEntity<Void> gestionarRolUsuario(
        @PathVariable Long apliId,
        @RequestBody GestionarRolUsuarioRequest request) {

    usuarioService.gestionarRolUsuario(
            apliId,
            request);

    return ResponseEntity.ok().build();
}

}
