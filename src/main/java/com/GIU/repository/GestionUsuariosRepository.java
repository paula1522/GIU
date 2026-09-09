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

import com.giu.model.GestionarRolUsuarioRequest;
import com.giu.model.UsuarioAplicacionDTO;
import com.giu.model.UsuarioRequestDTO;
import com.giu.model.UsuarioRolResponseDTO;
import com.giu.utils.Constantes;
import com.giu.utils.utilsBD;

import oracle.jdbc.OracleTypes;

@Repository
public class GestionUsuariosRepository {

        private static final Logger logger = LogManager.getLogger("GIU");

        /**
         * Consulta usuarios por usuario de red y/o estado.
         */
        public List<UsuarioRequestDTO> obtenerUsuarios(
                        String usuarioRed,
                        String estado) {

                List<UsuarioRequestDTO> usuarios = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.TIPO_CONEXION_JDBC,
                                Constantes.NOMBRE_BD_LOCAL)) {

                        String sql = "{ ? = call PKG_GIU_GESTION_USUARIOS.FN_OBTENER_USUARIO(?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.registerOutParameter(
                                                1,
                                                OracleTypes.CURSOR);

                                stmt.setString(2, usuarioRed);
                                stmt.setString(3, estado);

                                // No se expone como filtro del servicio
                                stmt.setNull(
                                                4,
                                                java.sql.Types.NUMERIC);

                                stmt.execute();

                                try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                        while (rs.next()) {

                                                UsuarioRequestDTO usuario = new UsuarioRequestDTO();

                                                usuario.setId(
                                                                rs.getLong("ID"));

                                                usuario.setUsuarioRed(
                                                                rs.getString("USUARIO_RED"));

                                                usuario.setNombre(
                                                                rs.getString("NOMBRE"));

                                                usuario.setCorreo(
                                                                rs.getString("CORREO"));

                                                usuario.setEstado(
                                                                rs.getString("ESTADO"));

                                                usuario.setNumeroIdentificacion(
                                                                rs.getString("NUMERO_IDENTIFICACION"));

                                                usuario.setSuperAdministrador(
                                                                rs.getString("SUPER_ADMINISTRADOR"));

                                                usuario.setFechaCreacion(
                                                                convertirFecha(
                                                                                rs.getTimestamp("FECHA_CREACION")));

                                                usuario.setUsuarioCreacion(
                                                                rs.getString("USUARIO_CREACION"));

                                                usuario.setFechaModificacion(
                                                                convertirFecha(
                                                                                rs.getTimestamp("FECHA_MODIFICACION")));

                                                usuario.setUsuarioModificacion(
                                                                rs.getString("USUARIO_MODIFICACION"));

                                                usuarios.add(usuario);
                                        }
                                }
                        }

                } catch (Exception e) {

                        logger.error(
                                        "Error consultando usuarios",
                                        e);

                        throw new RuntimeException(
                                        "Error consultando usuarios",
                                        e);
                }

                return usuarios;
        }

        /**
         * Consulta usuarios asociados a una aplicación.
         */
        public List<UsuarioAplicacionDTO> obtenerUsuarioXAplicacion(
                        Long apliId,
                        String estado) {

                List<UsuarioAplicacionDTO> usuarios = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.TIPO_CONEXION_JDBC,
                                Constantes.NOMBRE_BD_LOCAL)) {

                        String sql = "{ ? = call PKG_GIU_GESTION_USUARIOS.FN_OBTENER_USUARIO_X_APLICACION(?, ?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.registerOutParameter(
                                                1,
                                                OracleTypes.CURSOR);

                                stmt.setNull(
                                                2,
                                                java.sql.Types.VARCHAR);

                                stmt.setObject(
                                                3,
                                                apliId);

                                stmt.setString(
                                                4,
                                                estado);

                                stmt.setNull(
                                                5,
                                                java.sql.Types.VARCHAR);

                                stmt.execute();

                                try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                        while (rs.next()) {

                                                UsuarioAplicacionDTO usuario = new UsuarioAplicacionDTO();

                                                usuario.setId(
                                                                rs.getLong("ID"));

                                                usuario.setUsuarioRed(
                                                                rs.getString("USUARIO_RED"));

                                                usuario.setNombre(
                                                                rs.getString("NOMBRE"));

                                                usuario.setCorreo(
                                                                rs.getString("CORREO"));

                                                usuario.setNumeroIdentificacion(
                                                                rs.getString("NUMERO_IDENTIFICACION"));

                                                usuario.setEstadoUsua(
                                                                rs.getString("ESTADO_USUA"));

                                                usuario.setEsSuperAdmin(
                                                                rs.getString("ES_SUPER_ADMIN"));

                                                usuario.setFechaCreacion(
                                                                convertirFecha(
                                                                                rs.getTimestamp("FECHA_CREACION")));

                                                usuario.setUsuarioCreacion(
                                                                rs.getString("USUARIO_CREACION"));

                                                usuario.setFechaModificacion(
                                                                convertirFecha(
                                                                                rs.getTimestamp("FECHA_MODIFICACION")));

                                                usuario.setUsuarioModificacion(
                                                                rs.getString("USUARIO_MODIFICACION"));

                                                usuario.setCodigoApli(
                                                                rs.getString("CODIGO_APLI"));

                                                usuario.setNombreApli(
                                                                rs.getString("NOMBRE_APLI"));

                                                usuario.setEstadoApli(
                                                                rs.getString("ESTADO_APLI"));

                                                usuario.setIdRol(
                                                                rs.getObject(
                                                                                "ID_ROL",
                                                                                Long.class));

                                                usuario.setNombreRol(
                                                                rs.getString("NOMBRE_ROL"));

                                                usuario.setFechaInRol(
                                                                convertirFecha(
                                                                                rs.getTimestamp("FECHA_IN_ROL")));

                                                usuario.setFechaFinRol(
                                                                convertirFecha(
                                                                                rs.getTimestamp("FECHA_FIN_ROL")));

                                                usuarios.add(usuario);
                                        }
                                }
                        }

                } catch (Exception e) {

                        logger.error(
                                        "Error consultando usuarios asociados a la aplicacion",
                                        e);

                        throw new RuntimeException(
                                        "Error consultando usuarios asociados a la aplicacion",
                                        e);
                }

                return usuarios;
        }

        /**
         * Consulta el rol de un usuario para una aplicación específica
         */
        public UsuarioRolResponseDTO obtenerRolUsuario(
                        String usuarioRed,
                        Long apliId) {

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.TIPO_CONEXION_JDBC,
                                Constantes.NOMBRE_BD_LOCAL)) {

                        String sql = "{ ? = call PKG_GIU_GESTION_USUARIOS.FN_OBTENER_ROL_USUARIO("
                                        + "?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.registerOutParameter(1, OracleTypes.CURSOR);

                                stmt.setString(2, usuarioRed);
                                stmt.setLong(3, apliId);

                                // El endpoint no recibe rolId,
                                // por eso consultamos cualquier rol de esa aplicación.
                                stmt.setNull(4, Types.NUMERIC);

                                stmt.execute();

                                try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                        if (rs.next()) {

                                                UsuarioRolResponseDTO usuarioRol = new UsuarioRolResponseDTO();

                                                usuarioRol.setUsuarioRed(
                                                                rs.getString("USUA_USUARIO_RED"));

                                                usuarioRol.setApliId(
                                                                rs.getLong("APLI_ID"));

                                                usuarioRol.setRolId(
                                                                rs.getLong("ROL_ID"));

                                                usuarioRol.setFechaIn(
                                                                convertirFecha(
                                                                                rs.getTimestamp("FECHA_IN")));

                                                usuarioRol.setFechaFin(
                                                                convertirFecha(
                                                                                rs.getTimestamp("FECHA_FIN")));

                                                return usuarioRol;
                                        }
                                }

                                return null;

                        }

                } catch (Exception e) {

                        logger.error(
                                        "Error consultando rol del usuario: {}",
                                        usuarioRed,
                                        e);

                        throw new RuntimeException(
                                        "Error consultando rol del usuario",
                                        e);
                }
        }

        /**
         * Crea un nuevo usuario.
         */
        public void crearUsuario(
                        String usuarioRed,
                        String nombre,
                        String correo,
                        String numeroIdentificacion,
                        String usuarioCreacion) {

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.TIPO_CONEXION_JDBC,
                                Constantes.NOMBRE_BD_LOCAL)) {

                        String sql = "{ call PKG_GIU_GESTION_USUARIOS.PRC_CREAR_USUARIO("
                                        + "?, ?, ?, ?, ?, ?, ?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.setString(1, usuarioRed);
                                stmt.setString(2, nombre);
                                stmt.setString(3, correo);
                                stmt.setString(4, numeroIdentificacion);

                                // Super administrador = 0
                                stmt.setInt(5, 0);

                                stmt.setString(6, usuarioCreacion);

                                stmt.registerOutParameter(
                                                7,
                                                OracleTypes.CURSOR);

                                stmt.registerOutParameter(
                                                8,
                                                OracleTypes.NUMBER);

                                stmt.registerOutParameter(
                                                9,
                                                OracleTypes.VARCHAR);

                                stmt.execute();

                                int codigoSalida = stmt.getInt(8);

                                String mensajeSalida = stmt.getString(9);

                                if (codigoSalida != 0) {
                                        throw new RuntimeException(
                                                        mensajeSalida);
                                }

                                // El cursor se devuelve desde Oracle,
                                // pero este servicio solamente necesita
                                // validar el resultado de la operación.
                                try (ResultSet rs = (ResultSet) stmt.getObject(7)) {
                                        // No es necesario procesarlo.
                                }
                        }

                } catch (Exception e) {

                        logger.error(
                                        "Error creando usuario",
                                        e);

                        throw new RuntimeException(
                                        "Error creando usuario",
                                        e);
                }
        }

        /**
         * Modifica la información de un usuario.
         */
        public void modificarUsuario(
                        String usuarioRed,
                        String nombre,
                        String correo,
                        String numeroIdentificacion,
                        String usuarioModificacion) {

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.TIPO_CONEXION_JDBC,
                                Constantes.NOMBRE_BD_LOCAL)) {

                        String sql = "{ call PKG_GIU_GESTION_USUARIOS.PRC_MODIFICAR_USUARIO("
                                        + "?, ?, ?, ?, ?, ?, ?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.setString(1, usuarioRed);
                                stmt.setString(2, nombre);
                                stmt.setString(3, correo);
                                stmt.setString(4, numeroIdentificacion);

                                // No se modifica desde este servicio
                                stmt.setNull(
                                                5,
                                                java.sql.Types.NUMERIC);

                                stmt.setString(
                                                6,
                                                usuarioModificacion);

                                stmt.registerOutParameter(
                                                7,
                                                OracleTypes.CURSOR);

                                stmt.registerOutParameter(
                                                8,
                                                OracleTypes.NUMBER);

                                stmt.registerOutParameter(
                                                9,
                                                OracleTypes.VARCHAR);

                                stmt.execute();

                                int codigoSalida = stmt.getInt(8);

                                String mensajeSalida = stmt.getString(9);

                                if (codigoSalida != 0) {
                                        throw new RuntimeException(
                                                        mensajeSalida);
                                }

                                // El procedimiento devuelve un cursor,
                                // pero este servicio solamente necesita
                                // validar el código de salida.
                                try (ResultSet rs = (ResultSet) stmt.getObject(7)) {
                                        // No es necesario procesarlo.
                                }
                        }

                } catch (Exception e) {

                        logger.error(
                                        "Error modificando usuario",
                                        e);

                        throw new RuntimeException(
                                        "Error modificando usuario",
                                        e);
                }
        }

        /**
         * Convierte Timestamp a LocalDateTime.
         */
        private java.time.LocalDateTime convertirFecha(
                        Timestamp timestamp) {

                return timestamp != null
                                ? timestamp.toLocalDateTime()
                                : null;
        }

        /**
         * Asigna un rol a un usuario para una aplicación específica.
         */
        public void gestionarRolUsuario(
                        Long apliId,
                        GestionarRolUsuarioRequest request) {

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.TIPO_CONEXION_JDBC,
                                Constantes.NOMBRE_BD_LOCAL)) {

                        String sql = "{ call PKG_GIU_GESTION_USUARIOS.PRC_GESTIONAR_ROL_USUARIO("
                                        + "?, ?, ?, ?, ?, ?, ?, ?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                // IN 1 - Aplicación
                                stmt.setLong(1, apliId);

                                // IN 2 - Rol
                                stmt.setLong(2, request.getRolId());

                                // IN 3 - Usuario
                                stmt.setString(3, request.getUsuarioRed());

                                // IN 4 - Operación
                                // 0 = asignar
                                stmt.setInt(4, 0);

                                // IN 5 - Fecha inicio
                                if (request.getFechaIn() != null) {
                                        stmt.setTimestamp(
                                                        5,
                                                        Timestamp.valueOf(request.getFechaIn()));
                                } else {
                                        stmt.setNull(5, Types.TIMESTAMP);
                                }

                                // IN 6 - Fecha fin
                                if (request.getFechaFin() != null) {
                                        stmt.setTimestamp(
                                                        6,
                                                        Timestamp.valueOf(request.getFechaFin()));
                                } else {
                                        stmt.setNull(6, Types.TIMESTAMP);
                                }

                                // IN 7 - Usuario modificación
                                stmt.setString(
                                                7,
                                                request.getUsuarioModificacion());

                                // OUT 8 - Cursor
                                stmt.registerOutParameter(
                                                8,
                                                OracleTypes.CURSOR);

                                // OUT 9 - Código
                                stmt.registerOutParameter(
                                                9,
                                                OracleTypes.NUMBER);

                                // OUT 10 - Mensaje
                                stmt.registerOutParameter(
                                                10,
                                                OracleTypes.VARCHAR);

                                stmt.execute();

                                int codigoSalida = stmt.getInt(9);

                                String mensajeSalida = stmt.getString(10);

                                // 0 = operación exitosa
                                if (codigoSalida != 0) {

                                        throw new RuntimeException(
                                                        mensajeSalida != null
                                                                        ? mensajeSalida
                                                                        : "No fue posible asignar el rol al usuario.");
                                }

                                // El procedimiento devuelve un cursor,
                                // pero este servicio solamente responde OK.
                                try (ResultSet rs = (ResultSet) stmt.getObject(8)) {
                                        // No necesitamos procesarlo.
                                }
                        }

                } catch (Exception e) {

                        logger.error(
                                        "Error asignando rol {} al usuario {} en la aplicación {}",
                                        request.getRolId(),
                                        request.getUsuarioRed(),
                                        apliId,
                                        e);

                        throw new RuntimeException(
                                        "Error asignando rol al usuario.",
                                        e);
                }
        }
}