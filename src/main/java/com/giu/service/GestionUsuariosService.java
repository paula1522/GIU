package com.giu.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.giu.model.gestionSeguridad.GestionarEstadoUsuarioRequest;
import com.giu.model.gestionUsuarios.CrearUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.EliminarRolesUsuariosMasivoDTO;
import com.giu.model.gestionUsuarios.GestionarRolUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.GestionarRolesUsuariosRequestDTO;
import com.giu.model.gestionUsuarios.ModificarUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.UsuarioAplicacionResponseDTO;
import com.giu.model.gestionUsuarios.UsuarioMasivoExcelDTO;
import com.giu.model.gestionUsuarios.UsuarioResponseDTO;
import com.giu.model.gestionUsuarios.UsuarioRolRequestDTO;
import com.giu.model.gestionUsuarios.UsuarioRolResponseDTO;
import com.giu.repository.GestionSeguridadRepository;
import com.giu.repository.GestionUsuariosRepository;
import com.giu.utils.Constantes;
import com.giu.utils.ExcelUtils;
import com.giu.utils.TransaccionUtils;

@Service
public class GestionUsuariosService {

        private static final Logger logger = LogManager.getLogger(GestionUsuariosService.class);

        // Se inyecta el repositorio de gestión de usuarios en el servicio
        private final GestionUsuariosRepository gestionUsuariosRepository;
        private final GestionSeguridadRepository gestionSeguridadRepository;

        // Constructor para inyectar el repositorio de gestión de usuarios
        public GestionUsuariosService(GestionUsuariosRepository gestionUsuariosRepository,
                        GestionSeguridadRepository gestionSeguridadRepository) {
                this.gestionUsuariosRepository = gestionUsuariosRepository;
                this.gestionSeguridadRepository = gestionSeguridadRepository;
        }

        // Método para obtener los usuarios según el usuario de red y el estado
        // Método para obtener los usuarios según el usuario de red y el estado
        public List<UsuarioResponseDTO> obtenerUsuarios(String usuarioRed, String estado) {

                logger.info("obtenerUsuarios - inicio. usuarioRed={}, estado={}",
                                usuarioRed, estado);

                List<UsuarioResponseDTO> result = TransaccionUtils
                                .ejecutar(conn -> gestionUsuariosRepository.obtenerUsuarios(
                                                conn,
                                                usuarioRed,
                                                estado));

                logger.info("obtenerUsuarios - fin OK. total={}", result.size());

                return result;
        }

        // Método para obtener los usuarios asociados a una aplicación específica según
        // el estado
        public List<UsuarioAplicacionResponseDTO> obtenerUsuariosPorAplicacion(
                        Long apliId, String estado) {

                logger.info("obtenerUsuariosPorAplicacion - inicio. apliId={}, estado={}", apliId, estado);

                List<UsuarioAplicacionResponseDTO> result = gestionUsuariosRepository.obtenerUsuarioXAplicacion(
                                apliId,
                                estado);

                logger.info("obtenerUsuariosPorAplicacion - fin OK. total={}", result.size());
                return result;
        }

        // Método para obtener el rol de un usuario específico en una aplicación
        public UsuarioRolResponseDTO obtenerRolUsuario(String usuarioRed, Long apliId) {

                logger.info("obtenerRolUsuario - inicio. usuarioRed={}, apliId={}",
                                usuarioRed,
                                apliId);

                List<UsuarioRolResponseDTO> result = gestionUsuariosRepository.obtenerRolUsuario(
                                usuarioRed,
                                apliId,
                                null);

                UsuarioRolResponseDTO usuarioRol = result.isEmpty() ? null : result.get(0);

                logger.info("obtenerRolUsuario - fin OK. usuarioRed={}, rolId={}",
                                usuarioRed,
                                usuarioRol != null ? usuarioRol.getRolId() : null);

                return usuarioRol;
        }

        public List<UsuarioRolResponseDTO> obtenerUsuariosRol(Long rolId) {

                logger.info("obtenerUsuariosRol - inicio. rolId={}", rolId);

                List<UsuarioRolResponseDTO> result = gestionUsuariosRepository.obtenerRolUsuario(
                                null,
                                null,
                                rolId);

                logger.info(
                                "obtenerUsuariosRol - fin OK. rolId={}, total={}",
                                rolId,
                                result.size());

                return result;
        }

        // Método para crear un nuevo usuario en el sistema
        public UsuarioResponseDTO crearUsuario(
                        Long apliId,
                        CrearUsuarioRequestDTO request,
                        String usuarioCreacion) {

                logger.info("crearUsuario - inicio. usuarioRed={}, apliId={}, rolId={}",
                                request.getUsuarioRed(),
                                apliId,
                                request.getRol() != null ? request.getRol().getRolId() : null);

                UsuarioResponseDTO result = TransaccionUtils.ejecutar(conn -> {

                        // Crear usuario -> PRC_CREAR_USUARIO
                        UsuarioResponseDTO usuarioCreado = gestionUsuariosRepository.crearUsuario(
                                        conn,
                                        request,
                                        usuarioCreacion);

                        logger.info("crearUsuario - usuario creado. usuarioRed={}, id={}",
                                        request.getUsuarioRed(),
                                        usuarioCreado != null ? usuarioCreado.getId() : null);

                        // Gestionar rol de usuario -> PRC_GESTIONAR_ROL_USUARIO
                        GestionarRolUsuarioRequestDTO requestRol = request.getRol();

                        requestRol.setUsuarioRed(request.getUsuarioRed());
                        requestRol.setFechaIn(LocalDateTime.now());
                        requestRol.setFechaFin(null);

                        UsuarioRolResponseDTO rolAsignado = gestionUsuariosRepository.gestionarRolUsuario(
                                        conn,
                                        apliId,
                                        requestRol,
                                        usuarioCreacion,
                                        Constantes.OPERACION_ASIGNAR);

                        logger.info("crearUsuario - rol asignado. usuarioRed={}, apliId={}, rolId={}",
                                        request.getUsuarioRed(),
                                        apliId,
                                        requestRol.getRolId());

                        usuarioCreado.setRol(rolAsignado);

                        return usuarioCreado;
                });

                logger.info("crearUsuario - fin OK. usuarioRed={}, id={}",
                                request.getUsuarioRed(),
                                result != null ? result.getId() : null);

                return result;
        }

        
        // Método para modificar la información de un usuario existente en el sistema
        public UsuarioResponseDTO modificarUsuario(ModificarUsuarioRequestDTO request, String usuarioModificacion) {
                logger.info("modificarUsuario - inicio. usuarioRed={}", request.getUsuarioRed());

                UsuarioResponseDTO result = gestionUsuariosRepository.modificarUsuario(
                                request,
                                usuarioModificacion);

                logger.info("modificarUsuario - fin OK. usuarioRed={}, id={}",
                                request.getUsuarioRed(), result != null ? result.getId() : null);
                return result;
        }

        // Método para asignar roles de forma masiva mediante archivo Excel
        public List<UsuarioResponseDTO> asignarRolesMasivo(
                        Long apliId,
                        MultipartFile archivo,
                        String usuarioCreacion) {

                logger.info("asignarRolesMasivo - inicio. apliId={}", apliId);

                List<UsuarioMasivoExcelDTO> registros;

                try {

                        registros = ExcelUtils.leerExcel(
                                        archivo.getInputStream(),
                                        row -> {

                                                UsuarioMasivoExcelDTO registro = new UsuarioMasivoExcelDTO();

                                                registro.setUsuarioRed(
                                                                ExcelUtils.obtenerTexto(row.getCell(0)));

                                                registro.setNombre(
                                                                ExcelUtils.obtenerTexto(row.getCell(1)));

                                                registro.setCorreo(
                                                                ExcelUtils.obtenerTexto(row.getCell(2)));

                                                registro.setIdentificacion(
                                                                ExcelUtils.obtenerTexto(row.getCell(3)));

                                                registro.setRolId(
                                                                ExcelUtils.obtenerLong(row.getCell(4)));

                                                registro.setFechaIn(
                                                                ExcelUtils.obtenerFecha(row.getCell(5)));

                                                registro.setFechaFin(
                                                                ExcelUtils.obtenerFecha(row.getCell(6)));

                                                return registro;
                                        });

                } catch (Exception e) {

                        logger.error(
                                        "asignarRolesMasivo - error leyendo archivo Excel",
                                        e);

                        throw new RuntimeException(
                                        "Error leyendo el archivo Excel", e);
                }

                if (registros.isEmpty()) {
                        throw new RuntimeException("El archivo Excel no contiene registros");
                }

                List<UsuarioResponseDTO> resultado = TransaccionUtils.ejecutar(conn -> {

                        List<UsuarioResponseDTO> usuariosProcesados = new ArrayList<>();

                        for (UsuarioMasivoExcelDTO registro : registros) {

                                logger.info("asignarRolesMasivo - procesando usuarioRed={}, rolId={}",
                                                registro.getUsuarioRed(),
                                                registro.getRolId());

                                /*
                                 * Validar si el usuario ya existe
                                 */
                                List<UsuarioResponseDTO> usuarios = gestionUsuariosRepository.obtenerUsuarios(
                                                conn,
                                                registro.getUsuarioRed(),
                                                null);

                                GestionarRolUsuarioRequestDTO requestRol = new GestionarRolUsuarioRequestDTO();

                                requestRol.setRolId(registro.getRolId());
                                requestRol.setUsuarioRed(registro.getUsuarioRed());

                                requestRol.setFechaIn(
                                                registro.getFechaIn() != null
                                                                ? registro.getFechaIn()
                                                                : LocalDateTime.now());

                                requestRol.setFechaFin(registro.getFechaFin());

                                UsuarioResponseDTO usuario;

                                if (!usuarios.isEmpty()) {
                                        usuario = usuarios.get(0);

                                } else {
                                        CrearUsuarioRequestDTO request = new CrearUsuarioRequestDTO();

                                        request.setUsuarioRed(registro.getUsuarioRed());
                                        request.setNombre(registro.getNombre());
                                        request.setCorreo(registro.getCorreo());
                                        request.setNumeroIdentificacion(registro.getIdentificacion());
                                        request.setSuperAdministrador(registro.getSuperAdministrador());
                                        request.setRol(requestRol);

                                        usuario = gestionUsuariosRepository.crearUsuario(
                                                        conn,
                                                        request,
                                                        usuarioCreacion);
                                }

                                /*
                                 * Asignar rol al usuario.
                                 */
                                UsuarioRolResponseDTO rolAsignado = gestionUsuariosRepository.gestionarRolUsuario(
                                                conn,
                                                apliId,
                                                requestRol,
                                                usuarioCreacion,
                                                Constantes.OPERACION_ASIGNAR);

                                usuario.setRol(rolAsignado);

                                usuariosProcesados.add(usuario);
                        }

                        return usuariosProcesados;
                });

                logger.info("asignarRolesMasivo - fin OK. total={}",
                                resultado.size());

                return resultado;
        }

        // Método para retirar roles o inactivar usuarios de forma masiva mediante archivo Excel
        public void gestionarUsuariosMasivo(
                        Long apliId,
                        MultipartFile archivo,
                        String usuarioModificacion) {

                logger.info("gestionarUsuariosMasivo - inicio. apliId={}",
                                apliId);

                List<EliminarRolesUsuariosMasivoDTO> registros;

                try {

                        registros = ExcelUtils.leerExcel(archivo.getInputStream(),row -> {

                                                EliminarRolesUsuariosMasivoDTO registro = new EliminarRolesUsuariosMasivoDTO();

                                                registro.setUsuarioRed(ExcelUtils.obtenerTexto(row.getCell(0)));
                                                registro.setRolId(ExcelUtils.obtenerLong(row.getCell(1)));
                                                registro.setOperacion(ExcelUtils.obtenerTexto(row.getCell(2)));

                                                return registro;
                                        });

                } catch (Exception e) {

                        logger.error("gestionarUsuariosMasivo - error leyendo archivo Excel",e);

                        throw new RuntimeException("Error leyendo el archivo Excel", e);
                }

                if (registros.isEmpty()) {
                        throw new RuntimeException("El archivo Excel no contiene registros");
                }

                TransaccionUtils.ejecutar(conn -> {

                        for (EliminarRolesUsuariosMasivoDTO registro : registros) {

                                logger.info("gestionarUsuariosMasivo - procesando usuarioRed={}, rolId={}, operacion={}",
                                                registro.getUsuarioRed(),
                                                registro.getRolId(),
                                                registro.getOperacion());

                                if ("RETIRAR".equalsIgnoreCase(
                                                registro.getOperacion())) {

                                        GestionarRolUsuarioRequestDTO requestRol = new GestionarRolUsuarioRequestDTO();

                                        requestRol.setUsuarioRed(registro.getUsuarioRed());

                                        requestRol.setRolId(registro.getRolId());

                                        gestionUsuariosRepository.gestionarRolUsuario(
                                                        conn,
                                                        apliId,
                                                        requestRol,
                                                        usuarioModificacion,
                                                        Constantes.OPERACION_RETIRAR);

                                } else if ("INACTIVAR".equalsIgnoreCase(
                                                registro.getOperacion())) {

                                        GestionarEstadoUsuarioRequest request = new GestionarEstadoUsuarioRequest();

                                        request.setApliId(apliId);
                                        request.setUsuarioRed(registro.getUsuarioRed());
                                        request.setOperacion(Constantes.OPERACION_INACTIVAR);

                                        gestionSeguridadRepository.gestionarEstadoUsuario(conn,request);

                                } else {

                                        throw new RuntimeException("Operación inválida para el usuario "
                                                                        + registro.getUsuarioRed()
                                                                        + ": "
                                                                        + registro.getOperacion());
                                }
                        }

                        return null;
                });

                logger.info("gestionarUsuariosMasivo - fin OK. total={}",
                                registros.size());
        }

        // Método asignar rol a usuario
        public UsuarioRolResponseDTO asignarRolUsuario(
                        Long apliId,
                        GestionarRolUsuarioRequestDTO request,
                        String usuarioModificacion) {

                logger.info("asignarRolUsuario - inicio. usuarioRed={}, apliId={}, rolId={}",
                                request.getUsuarioRed(), apliId, request.getRolId());

                UsuarioRolResponseDTO result = TransaccionUtils
                                .ejecutar(conn -> gestionUsuariosRepository.gestionarRolUsuario(
                                                conn,
                                                apliId,
                                                request,
                                                usuarioModificacion,
                                                Constantes.OPERACION_ASIGNAR));

                logger.info("asignarRolUsuario - fin OK. usuarioRed={}, rolId={}",
                                request.getUsuarioRed(), request.getRolId());

                return result;
        }

        // Método actualizar vigencia de un rol a usuario
        public UsuarioRolResponseDTO actualizarVigenciaRolUsuario(
                        Long apliId,
                        GestionarRolUsuarioRequestDTO request,
                        String usuarioModificacion) {

                logger.info("actualizarVigenciaRolUsuario - inicio. usuarioRed={}, apliId={}, rolId={}",
                                request.getUsuarioRed(), apliId, request.getRolId());

                UsuarioRolResponseDTO result = TransaccionUtils
                                .ejecutar(conn -> gestionUsuariosRepository.gestionarRolUsuario(
                                                conn,
                                                apliId,
                                                request,
                                                usuarioModificacion,
                                                Constantes.OPERACION_VIGENCIA));

                logger.info("actualizarVigenciaRolUsuario - fin OK. usuarioRed={}, rolId={}",
                                request.getUsuarioRed(), request.getRolId());

                return result;
        }

        // Método retirar rol a un usuario
        public UsuarioRolResponseDTO retirarRolUsuario(
                        Long apliId,
                        GestionarRolUsuarioRequestDTO request,
                        String usuarioModificacion) {

                logger.info("retirarRolUsuario - inicio. usuarioRed={}, apliId={}, rolId={}",
                                request.getUsuarioRed(), apliId, request.getRolId());

                UsuarioRolResponseDTO result = TransaccionUtils
                                .ejecutar(conn -> gestionUsuariosRepository.gestionarRolUsuario(
                                                conn,
                                                apliId,
                                                request,
                                                usuarioModificacion,
                                                Constantes.OPERACION_RETIRAR));

                logger.info("retirarRolUsuario - fin OK. usuarioRed={}, rolId={}",
                                request.getUsuarioRed(), request.getRolId());

                return result;
        }

        public List<UsuarioRolResponseDTO> retirarRolesUsuarios(
                        Long apliId,
                        GestionarRolesUsuariosRequestDTO request,
                        String usuarioModificacion) {

                logger.info("retirarRolesUsuarios - inicio. apliId={}, total={}",
                                apliId, request.getUsuariosRed().size());

                List<UsuarioRolResponseDTO> retirados = new ArrayList<>();

                TransaccionUtils.ejecutar(conn -> {

                        for (UsuarioRolRequestDTO usuario : request.getUsuariosRed()) {

                                logger.debug("retirarRolesUsuarios - procesando. usuarioRed={}, rolId={}",
                                                usuario.getUsuarioRed(), usuario.getRolId());

                                GestionarRolUsuarioRequestDTO rolRequest = new GestionarRolUsuarioRequestDTO();
                                rolRequest.setUsuarioRed(usuario.getUsuarioRed());
                                rolRequest.setRolId(usuario.getRolId());

                                UsuarioRolResponseDTO resultado = gestionUsuariosRepository.gestionarRolUsuario(
                                                conn,
                                                apliId,
                                                rolRequest,
                                                usuarioModificacion,
                                                Constantes.OPERACION_RETIRAR);

                                if (resultado != null) {
                                        retirados.add(resultado);
                                } else {
                                        logger.warn("retirarRolesUsuarios - sin respuesta del SP. usuarioRed={}, rolId={}",
                                                        usuario.getUsuarioRed(),
                                                        usuario.getRolId());
                                }
                        }

                        return null;
                });

                logger.info("retirarRolesUsuarios - fin OK. totalRetirados={}", retirados.size());
                return retirados;
        }


}