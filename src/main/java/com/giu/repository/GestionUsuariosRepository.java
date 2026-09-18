package com.giu.repository;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Repository;

import com.giu.model.gestionUsuarios.GestionarRolUsuarioRequestDTO;
import com.giu.model.gestionUsuarios.UsuarioAplicacionResponseDTO;
import com.giu.model.gestionUsuarios.UsuarioResponseDTO;
import com.giu.model.gestionUsuarios.UsuarioRolResponseDTO;
import com.giu.utils.BooleanUtils;
import com.giu.utils.Constantes;
import com.giu.utils.utilsBD;
import com.giu.utils.FechaUtils;

import oracle.jdbc.OracleTypes;

@Repository
public class GestionUsuariosRepository {

        private static final Logger logger = LogManager.getLogger(GestionUsuariosRepository.class);

        // Consultar usuarios -> FN_OBTENER_USUARIO
        public List<UsuarioResponseDTO> obtenerUsuarios(String usuarioRed, String estado) {

                logger.debug("obtenerUsuarios - ejecutando FN_OBTENER_USUARIO. usuarioRed={}, estado={}", usuarioRed,
                                estado);

                List<UsuarioResponseDTO> usuarios = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        String sql = "{ ? = call PKG_GIU_GESTION_USUARIOS.FN_OBTENER_USUARIO(?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.registerOutParameter(1, OracleTypes.CURSOR);
                                stmt.setString(2, usuarioRed);
                                stmt.setString(3, estado);
                                stmt.setNull(4, Types.NUMERIC);

                                stmt.execute();

                                try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                        while (rs.next()) {

                                                UsuarioResponseDTO usuario = new UsuarioResponseDTO();

                                                usuario.setId(rs.getLong("ID"));
                                                usuario.setUsuarioRed(rs.getString("USUARIO_RED"));
                                                usuario.setNombre(rs.getString("NOMBRE"));
                                                usuario.setCorreo(rs.getString("CORREO"));
                                                usuario.setEstado(rs.getString("ESTADO"));
                                                usuario.setNumeroIdentificacion(rs.getString("NUMERO_IDENTIFICACION"));
                                                usuario.setSuperAdministrador(rs.getInt("SUPER_ADMINISTRADOR"));
                                                usuario.setFechaCreacion(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_CREACION")));
                                                usuario.setUsuarioCreacion(rs.getString("USUARIO_CREACION"));
                                                usuario.setFechaModificacion(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_MODIFICACION")));
                                                usuario.setUsuarioModificacion(rs.getString("USUARIO_MODIFICACION"));
                                                usuarios.add(usuario);
                                        }
                                }
                        }

                        logger.debug("obtenerUsuarios - registros mapeados. total={}", usuarios.size());

                } catch (Exception e) {

                        logger.error("obtenerUsuarios - error. usuarioRed={}, estado={}", usuarioRed, estado, e);

                        throw new RuntimeException("Error consultando usuarios", e);
                }

                return usuarios;
        }

        // Consultar usuarios asociados a una aplicación ->
        // FN_OBTENER_USUARIO_X_APLICACION
        public List<UsuarioAplicacionResponseDTO> obtenerUsuarioXAplicacion(Long apliId, String estado) {

                logger.debug("obtenerUsuarioXAplicacion - ejecutando FN_OBTENER_USUARIO_X_APLICACION. apliId={}, estado={}",
                                apliId, estado);

                List<UsuarioAplicacionResponseDTO> usuarios = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU)) {

                        String sql = "{ ? = call PKG_GIU_GESTION_USUARIOS.FN_OBTENER_USUARIO_X_APLICACION(?, ?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.registerOutParameter(1, OracleTypes.CURSOR);
                                stmt.setNull(2, Types.VARCHAR);
                                stmt.setObject(3, apliId);
                                stmt.setString(4, estado);
                                stmt.setNull(5, Types.VARCHAR);

                                stmt.execute();

                                try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                        while (rs.next()) {

                                                UsuarioAplicacionResponseDTO usuario = new UsuarioAplicacionResponseDTO();

                                                usuario.setId(rs.getLong("ID"));
                                                usuario.setUsuarioRed(rs.getString("USUARIO_RED"));
                                                usuario.setNombre(rs.getString("NOMBRE"));
                                                usuario.setCorreo(rs.getString("CORREO"));
                                                usuario.setNumeroIdentificacion(rs.getString("NUMERO_IDENTIFICACION"));
                                                usuario.setEstadoUsua(rs.getString("ESTADO_USUA"));
                                                usuario.setEsSuperAdmin(rs.getInt("ES_SUPER_ADMIN"));
                                                usuario.setFechaCreacion(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_CREACION")));
                                                usuario.setUsuarioCreacion(rs.getString("USUARIO_CREACION"));
                                                usuario.setFechaModificacion(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_MODIFICACION")));
                                                usuario.setUsuarioModificacion(rs.getString("USUARIO_MODIFICACION"));
                                                usuario.setCodigoApli(rs.getString("CODIGO_APLI"));
                                                usuario.setNombreApli(rs.getString("NOMBRE_APLI"));
                                                usuario.setEstadoApli(rs.getString("ESTADO_APLI"));
                                                usuario.setIdRol(rs.getObject("ID_ROL", Long.class));
                                                usuario.setNombreRol(rs.getString("NOMBRE_ROL"));
                                                usuario.setFechaInRol(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_IN_ROL")));
                                                usuario.setFechaFinRol(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_FIN_ROL")));
                                                usuarios.add(usuario);
                                        }
                                }
                        }

                        logger.debug("obtenerUsuarioXAplicacion - registros mapeados. total={}", usuarios.size());

                } catch (Exception e) {

                        logger.error("obtenerUsuarioXAplicacion - error. apliId={}, estado={}", apliId, estado, e);

                        throw new RuntimeException(e);
                }

                return usuarios;
        }

        // Consultar rol de un usuario en una aplicación -> FN_OBTENER_ROL_USUARIO
        public UsuarioRolResponseDTO obtenerRolUsuario(String usuarioRed, Long apliId) {

                logger.debug("obtenerRolUsuario - ejecutando FN_OBTENER_ROL_USUARIO. usuarioRed={}, apliId={}",
                                usuarioRed, apliId);

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        String sql = "{ ? = call PKG_GIU_GESTION_USUARIOS.FN_OBTENER_ROL_USUARIO(?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.registerOutParameter(1, OracleTypes.CURSOR);
                                stmt.setString(2, usuarioRed);
                                stmt.setLong(3, apliId);
                                stmt.setNull(4, Types.NUMERIC);
                                stmt.execute();

                                try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                        if (rs.next()) {

                                                UsuarioRolResponseDTO usuarioRol = new UsuarioRolResponseDTO();

                                                usuarioRol.setUsuarioRed(rs.getString("USUA_USUARIO_RED"));
                                                usuarioRol.setApliId(rs.getLong("APLI_ID"));
                                                usuarioRol.setRolId(rs.getLong("ROL_ID"));
                                                usuarioRol.setFechaIn(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_IN")));
                                                usuarioRol.setFechaFin(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_FIN")));

                                                logger.debug("obtenerRolUsuario - registro mapeado. usuarioRed={}, rolId={}",
                                                                usuarioRed, usuarioRol.getRolId());
                                                return usuarioRol;
                                        }
                                }

                                logger.warn("obtenerRolUsuario - el cursor vino vacío. usuarioRed={}, apliId={}",
                                                usuarioRed, apliId);
                                return null;
                        }

                } catch (Exception e) {

                        logger.error("obtenerRolUsuario - error. usuarioRed={}, apliId={}", usuarioRed, apliId, e);

                        throw new RuntimeException(e);
                }
        }

        // Crear usuario -> PRC_CREAR_USUARIO
        public UsuarioResponseDTO crearUsuario(
                        String usuarioRed,
                        String nombre,
                        String correo,
                        String numeroIdentificacion,
                        Boolean superAdministrador,
                        String usuarioCreacion) {

                logger.debug("crearUsuario - ejecutando PRC_CREAR_USUARIO. usuarioRed={}, usuarioCreacion={}",
                                usuarioRed, usuarioCreacion);

                String sql = "{ call PKG_GIU_GESTION_USUARIOS.PRC_CREAR_USUARIO(?, ?, ?, ?, ?, ?, ?, ?, ?) }";

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.setString(1, usuarioRed);
                                stmt.setString(2, nombre);
                                stmt.setString(3, correo);
                                stmt.setString(4, numeroIdentificacion);
                                Integer superAdmin = BooleanUtils.booleanToSuperAdmin(superAdministrador);
                                stmt.setInt(5, superAdmin != null ? superAdmin : 0);

                                stmt.setString(6, usuarioCreacion);

                                stmt.registerOutParameter(7, OracleTypes.CURSOR);
                                stmt.registerOutParameter(8, OracleTypes.NUMBER);
                                stmt.registerOutParameter(9, OracleTypes.VARCHAR);

                                stmt.execute();

                                int codigoSalida = stmt.getInt(8);
                                String mensajeSalida = stmt.getString(9);

                                logger.debug("crearUsuario - PLrespondió. codigo={}, mensaje={}", codigoSalida,
                                                mensajeSalida);

                                utilsBD.validarResultado(codigoSalida, mensajeSalida);

                                try (ResultSet rs = (ResultSet) stmt.getObject(7)) {

                                        if (rs.next()) {

                                                UsuarioResponseDTO usuario = new UsuarioResponseDTO();

                                                usuario.setId(rs.getLong("ID"));
                                                usuario.setUsuarioRed(rs.getString("USUARIO_RED"));
                                                usuario.setNombre(rs.getString("NOMBRE"));
                                                usuario.setCorreo(rs.getString("CORREO"));
                                                usuario.setEstado(rs.getString("ESTADO"));
                                                usuario.setNumeroIdentificacion(rs.getString("NUMERO_IDENTIFICACION"));
                                                usuario.setSuperAdministrador(rs.getInt("SUPER_ADMINISTRADOR"));

                                                usuario.setFechaCreacion(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_CREACION")));

                                                usuario.setUsuarioCreacion(rs.getString("USUARIO_CREACION"));

                                                usuario.setFechaModificacion(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_MODIFICACION")));

                                                usuario.setUsuarioModificacion(rs.getString("USUARIO_MODIFICACION"));

                                                logger.debug("crearUsuario - registro mapeado. id={}, usuarioRed={}",
                                                                usuario.getId(), usuarioRed);
                                                return usuario;
                                        }
                                }

                                logger.warn("crearUsuario - el cursor vino vacío. usuarioRed={}", usuarioRed);
                                return null;

                        }

                } catch (Exception e) {

                        logger.error("crearUsuario - error ejecutando SP. usuarioRed={}", usuarioRed, e);

                        throw new RuntimeException(e);
                }
        }

        // Modificar usuario -> PRC_MODIFICAR_USUARIO
        public UsuarioResponseDTO modificarUsuario(
                        String usuarioRed,
                        String nombre,
                        String correo,
                        String numeroIdentificacion,
                        Boolean superAdministrador,
                        String usuarioModificacion) {

                logger.debug("modificarUsuario - ejecutando PRC_MODIFICAR_USUARIO. usuarioRed={}, usuarioModificacion={}",
                                usuarioRed, usuarioModificacion);

                String sql = "{ call PKG_GIU_GESTION_USUARIOS.PRC_MODIFICAR_USUARIO(?, ?, ?, ?, ?, ?, ?, ?, ?) }";

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.setString(1, usuarioRed);
                                stmt.setString(2, nombre);
                                stmt.setString(3, correo);
                                stmt.setString(4, numeroIdentificacion);
                                Integer superAdmin = BooleanUtils.booleanToSuperAdmin(superAdministrador);
                                if (superAdmin != null) {
                                        stmt.setInt(5, superAdmin);
                                } else {
                                        stmt.setNull(5, Types.NUMERIC);
                                }

                                stmt.setString(6, usuarioModificacion);
                                stmt.registerOutParameter(7, OracleTypes.CURSOR);
                                stmt.registerOutParameter(8, OracleTypes.NUMBER);
                                stmt.registerOutParameter(9, OracleTypes.VARCHAR);

                                stmt.execute();

                                int codigoSalida = stmt.getInt(8);
                                String mensajeSalida = stmt.getString(9);

                                logger.debug("modificarUsuario - PLrespondió. codigo={}, mensaje={}", codigoSalida,
                                                mensajeSalida);

                                utilsBD.validarResultado(codigoSalida, mensajeSalida);

                                try (ResultSet rs = (ResultSet) stmt.getObject(7)) {

                                        if (rs.next()) {

                                                UsuarioResponseDTO usuario = new UsuarioResponseDTO();

                                                usuario.setId(rs.getLong("ID"));
                                                usuario.setUsuarioRed(rs.getString("USUARIO_RED"));
                                                usuario.setNombre(rs.getString("NOMBRE"));
                                                usuario.setCorreo(rs.getString("CORREO"));
                                                usuario.setEstado(rs.getString("ESTADO"));
                                                usuario.setNumeroIdentificacion(rs.getString("NUMERO_IDENTIFICACION"));
                                                usuario.setSuperAdministrador(rs.getInt("SUPER_ADMINISTRADOR"));

                                                usuario.setFechaCreacion(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_CREACION")));

                                                usuario.setUsuarioCreacion(rs.getString("USUARIO_CREACION"));

                                                usuario.setFechaModificacion(FechaUtils.convertirFecha(
                                                                rs.getTimestamp("FECHA_MODIFICACION")));

                                                usuario.setUsuarioModificacion(rs.getString("USUARIO_MODIFICACION"));

                                                logger.debug("modificarUsuario - registro mapeado. id={}, usuarioRed={}",
                                                                usuario.getId(), usuarioRed);
                                                return usuario;
                                        }
                                }

                                logger.warn("modificarUsuario - el cursor vino vacío. usuarioRed={}", usuarioRed);
                                return null;

                        }

                } catch (Exception e) {

                        logger.error("modificarUsuario - error ejecutando SP. usuarioRed={}", usuarioRed, e);

                        throw new RuntimeException("Error modificando usuario", e);
                }
        }

        // Gestionar rol de un usuario en una aplicación -> PRC_GESTIONAR_ROL_USUARIO
        public UsuarioRolResponseDTO gestionarRolUsuario(Connection conn, Long apliId,
                        GestionarRolUsuarioRequestDTO request,
                        String usuarioModificacion,
                        Integer operacion) {

                logger.debug("gestionarRolUsuario - ejecutando PRC_GESTIONAR_ROL_USUARIO. usuarioRed={}, apliId={}, rolId={}, operacion={}",
                                request.getUsuarioRed(), apliId, request.getRolId(), operacion);

                String sql = "{ call PKG_GIU_GESTION_USUARIOS.PRC_GESTIONAR_ROL_USUARIO(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) }";

                try (CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.setLong(1, apliId);
                        stmt.setLong(2, request.getRolId());
                        stmt.setString(3, request.getUsuarioRed());
                        stmt.setInt(4, operacion);

                        if (request.getFechaIn() != null) {
                                stmt.setTimestamp(5, Timestamp.valueOf(request.getFechaIn()));
                        } else {
                                stmt.setNull(5, Types.TIMESTAMP);
                        }

                        if (request.getFechaFin() != null) {
                                stmt.setTimestamp(6, Timestamp.valueOf(request.getFechaFin()));
                        } else {
                                stmt.setNull(6, Types.TIMESTAMP);
                        }

                        stmt.setString(7, usuarioModificacion);

                        stmt.registerOutParameter(8, OracleTypes.CURSOR);
                        stmt.registerOutParameter(9, OracleTypes.NUMBER);
                        stmt.registerOutParameter(10, OracleTypes.VARCHAR);

                        stmt.execute();

                        int codigoSalida = stmt.getInt(9);
                        String mensajeSalida = stmt.getString(10);

                        logger.debug("gestionarRolUsuario - PLrespondió. codigo={}, mensaje={}", codigoSalida,
                                        mensajeSalida);

                        utilsBD.validarResultado(codigoSalida, mensajeSalida);

                        try (ResultSet rs = (ResultSet) stmt.getObject(8)) {

                                if (rs.next()) {

                                        UsuarioRolResponseDTO usuarioRol = new UsuarioRolResponseDTO();

                                        usuarioRol.setUsuarioRed(rs.getString("USUA_USUARIO_RED"));
                                        usuarioRol.setApliId(rs.getLong("APLI_ID"));
                                        usuarioRol.setRolId(rs.getLong("ROL_ID"));
                                        usuarioRol.setFechaIn(FechaUtils.convertirFecha(
                                                        rs.getTimestamp("FECHA_IN")));
                                        usuarioRol.setFechaFin(FechaUtils.convertirFecha(
                                                        rs.getTimestamp("FECHA_FIN")));

                                        logger.debug("gestionarRolUsuario - registro mapeado. usuarioRed={}, rolId={}, operacion={}",
                                                        usuarioRol.getUsuarioRed(), usuarioRol.getRolId(),
                                                        operacion);
                                        return usuarioRol;
                                }
                        }

                        logger.warn("gestionarRolUsuario - el cursor vino vacío. usuarioRed={}, apliId={}, rolId={}, operacion={}",
                                        request.getUsuarioRed(), apliId, request.getRolId(), operacion);
                        return null;

                } catch (Exception e) {

                        logger.error("gestionarRolUsuario - error ejecutando SP. usuarioRed={}, apliId={}, rolId={}, operacion={}",
                                        request.getUsuarioRed(), apliId, request.getRolId(), operacion, e);

                        throw new RuntimeException(e);
                }
        }

}