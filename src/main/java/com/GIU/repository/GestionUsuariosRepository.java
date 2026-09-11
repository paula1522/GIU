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

import com.giu.exception.ErrorOperacionException;
import com.giu.model.GestionarRolUsuarioRequest;
import com.giu.model.UsuarioAplicacionDTO;
import com.giu.model.UsuarioRequestDTO;
import com.giu.model.UsuarioRolResponseDTO;
import com.giu.utils.Constantes;
import com.giu.utils.TipoRespuesta;
import com.giu.utils.utilsBD;

import oracle.jdbc.OracleTypes;

@Repository
public class GestionUsuariosRepository {

        private static final Logger logger = LogManager.getLogger("GIU");

        /*
         * CONSULTAR USUARIOS
         */
        public List<UsuarioRequestDTO> obtenerUsuarios(
                        String usuarioRed,
                        String estado) {

                List<UsuarioRequestDTO> usuarios = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        String sql = "{ ? = call PKG_GIU_GESTION_USUARIOS.FN_OBTENER_USUARIO(?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.registerOutParameter(
                                                1,
                                                OracleTypes.CURSOR);

                                stmt.setString(2, usuarioRed);
                                stmt.setString(3, estado);
                                stmt.setNull(4, Types.NUMERIC);

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
                                                                                rs.getTimestamp(
                                                                                                "FECHA_CREACION")));

                                                usuario.setUsuarioCreacion(
                                                                rs.getString("USUARIO_CREACION"));

                                                usuario.setFechaModificacion(
                                                                convertirFecha(
                                                                                rs.getTimestamp(
                                                                                                "FECHA_MODIFICACION")));

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

                        throw new RuntimeException(e);
                }

                return usuarios;
        }

        /*
         * CONSULTAR USUARIOS POR APLICACIÓN
         */
        public List<UsuarioAplicacionDTO> obtenerUsuarioXAplicacion(
                        Long apliId,
                        String estado) {

                List<UsuarioAplicacionDTO> usuarios = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        String sql = "{ ? = call PKG_GIU_GESTION_USUARIOS.FN_OBTENER_USUARIO_X_APLICACION(?, ?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.registerOutParameter(
                                                1,
                                                OracleTypes.CURSOR);

                                stmt.setNull(
                                                2,
                                                Types.VARCHAR);

                                stmt.setObject(
                                                3,
                                                apliId);

                                stmt.setString(
                                                4,
                                                estado);

                                stmt.setNull(
                                                5,
                                                Types.VARCHAR);

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
                                                                                rs.getTimestamp(
                                                                                                "FECHA_CREACION")));

                                                usuario.setUsuarioCreacion(
                                                                rs.getString("USUARIO_CREACION"));

                                                usuario.setFechaModificacion(
                                                                convertirFecha(
                                                                                rs.getTimestamp(
                                                                                                "FECHA_MODIFICACION")));

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
                                                                                rs.getTimestamp(
                                                                                                "FECHA_IN_ROL")));

                                                usuario.setFechaFinRol(
                                                                convertirFecha(
                                                                                rs.getTimestamp(
                                                                                                "FECHA_FIN_ROL")));

                                                usuarios.add(usuario);
                                        }
                                }
                        }

                } catch (Exception e) {

                        logger.error(
                                        "Error consultando usuarios asociados a la aplicación",
                                        e);

                        throw new RuntimeException(e);
                }

                return usuarios;
        }

        /*
         * CONSULTAR ROL DEL USUARIO
         */
        public UsuarioRolResponseDTO obtenerRolUsuario(
                        String usuarioRed,
                        Long apliId) {

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        String sql = "{ ? = call PKG_GIU_GESTION_USUARIOS.FN_OBTENER_ROL_USUARIO(?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.registerOutParameter(
                                                1,
                                                OracleTypes.CURSOR);

                                stmt.setString(
                                                2,
                                                usuarioRed);

                                stmt.setLong(
                                                3,
                                                apliId);

                                stmt.setNull(
                                                4,
                                                Types.NUMERIC);

                                stmt.execute();

                                try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                        if (rs.next()) {

                                                UsuarioRolResponseDTO usuarioRol = new UsuarioRolResponseDTO();

                                                usuarioRol.setUsuarioRed(
                                                                rs.getString(
                                                                                "USUA_USUARIO_RED"));

                                                usuarioRol.setApliId(
                                                                rs.getLong(
                                                                                "APLI_ID"));

                                                usuarioRol.setRolId(
                                                                rs.getLong(
                                                                                "ROL_ID"));

                                                usuarioRol.setFechaIn(
                                                                convertirFecha(
                                                                                rs.getTimestamp(
                                                                                                "FECHA_IN")));

                                                usuarioRol.setFechaFin(
                                                                convertirFecha(
                                                                                rs.getTimestamp(
                                                                                                "FECHA_FIN")));

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

                        throw new RuntimeException(e);
                }
        }

        /*
         * CREAR USUARIO
         */
        public void crearUsuario(
                        String usuarioRed,
                        String nombre,
                        String correo,
                        String numeroIdentificacion,
                        String usuarioCreacion) {

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        String sql = "{ call PKG_GIU_GESTION_USUARIOS.PRC_CREAR_USUARIO(?, ?, ?, ?, ?, ?, ?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.setString(
                                                1,
                                                usuarioRed);

                                stmt.setString(
                                                2,
                                                nombre);

                                stmt.setString(
                                                3,
                                                correo);

                                stmt.setString(
                                                4,
                                                numeroIdentificacion);

                                stmt.setInt(
                                                5,
                                                0);

                                stmt.setString(
                                                6,
                                                usuarioCreacion);

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

                                validarResultadoCrearUsuario(
                                                codigoSalida,
                                                mensajeSalida);

                                try (ResultSet rs = (ResultSet) stmt.getObject(7)) {
                                        // El procedimiento ya realizó la operación.
                                        // No necesitamos recorrer el cursor aquí.
                                }
                        }

                } catch (ErrorOperacionException e) {

                        throw e;

                } catch (Exception e) {

                        logger.error(
                                        "Error creando usuario",
                                        e);

                        throw new RuntimeException(e);
                }
        }

        /*
         * MODIFICAR USUARIO
         */
        public void modificarUsuario(
                        String usuarioRed,
                        String nombre,
                        String correo,
                        String numeroIdentificacion,
                        String usuarioModificacion) {

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        String sql = "{ call PKG_GIU_GESTION_USUARIOS.PRC_MODIFICAR_USUARIO(?, ?, ?, ?, ?, ?, ?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.setString(
                                                1,
                                                usuarioRed);

                                stmt.setString(
                                                2,
                                                nombre);

                                stmt.setString(
                                                3,
                                                correo);

                                stmt.setString(
                                                4,
                                                numeroIdentificacion);

                                stmt.setNull(
                                                5,
                                                Types.NUMERIC);

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

                                validarResultadoModificarUsuario(
                                                codigoSalida,
                                                mensajeSalida);

                                try (ResultSet rs = (ResultSet) stmt.getObject(7)) {
                                        // No necesitamos recorrer el cursor.
                                }
                        }

                } catch (ErrorOperacionException e) {

                        throw e;

                } catch (Exception e) {

                        logger.error(
                                        "Error modificando usuario",
                                        e);

                        throw new RuntimeException(e);
                }
        }

        /*
         * GESTIONAR ROL DEL USUARIO
         */
        public void gestionarRolUsuario(
                        Long apliId,
                        GestionarRolUsuarioRequest request) {

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        String sql = "{ call PKG_GIU_GESTION_USUARIOS.PRC_GESTIONAR_ROL_USUARIO(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.setLong(
                                                1,
                                                apliId);

                                stmt.setLong(
                                                2,
                                                request.getRolId());

                                stmt.setString(
                                                3,
                                                request.getUsuarioRed());

                                stmt.setInt(
                                                4,
                                                0);

                                if (request.getFechaIn() != null) {

                                        stmt.setTimestamp(
                                                        5,
                                                        Timestamp.valueOf(
                                                                        request.getFechaIn()));

                                } else {

                                        stmt.setNull(
                                                        5,
                                                        Types.TIMESTAMP);
                                }

                                if (request.getFechaFin() != null) {

                                        stmt.setTimestamp(
                                                        6,
                                                        Timestamp.valueOf(
                                                                        request.getFechaFin()));

                                } else {

                                        stmt.setNull(
                                                        6,
                                                        Types.TIMESTAMP);
                                }

                                stmt.setString(
                                                7,
                                                request.getUsuarioModificacion());

                                stmt.registerOutParameter(
                                                8,
                                                OracleTypes.CURSOR);

                                stmt.registerOutParameter(
                                                9,
                                                OracleTypes.NUMBER);

                                stmt.registerOutParameter(
                                                10,
                                                OracleTypes.VARCHAR);

                                stmt.execute();

                                int codigoSalida = stmt.getInt(9);

                                String mensajeSalida = stmt.getString(10);

                                validarResultadoGestionRol(
                                                codigoSalida,
                                                mensajeSalida);

                                try (ResultSet rs = (ResultSet) stmt.getObject(8)) {
                                        // No necesitamos recorrer el cursor.
                                }
                        }

                } catch (ErrorOperacionException e) {

                        throw e;

                } catch (Exception e) {

                        logger.error(
                                        "Error gestionando rol {} del usuario {} en la aplicación {}",
                                        request.getRolId(),
                                        request.getUsuarioRed(),
                                        apliId,
                                        e);

                        throw new RuntimeException(e);
                }
        }

        /*
         * VALIDAR RESULTADO CREAR USUARIO
         */
        private void validarResultadoCrearUsuario(
                        int codigoSalida,
                        String mensajeSalida) {

                if (codigoSalida == 0) {
                        return;
                }

                switch (codigoSalida) {

                        case 1:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.DATOS_INVALIDOS,
                                                mensajeSalida);

                        case 2:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.NO_ENCONTRADO,
                                                mensajeSalida);

                        case 3:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.OPERACION_NO_REALIZADA,
                                                mensajeSalida);

                        case 4:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.YA_EXISTE,
                                                mensajeSalida);

                        case 5:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.NO_ENCONTRADO,
                                                mensajeSalida);

                        case 6:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.DATOS_INVALIDOS,
                                                mensajeSalida);

                        default:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.ERROR_BD,
                                                mensajeSalida);
                }
        }

        /*
         * VALIDAR RESULTADO MODIFICAR USUARIO
         */
        private void validarResultadoModificarUsuario(
                        int codigoSalida,
                        String mensajeSalida) {

                if (codigoSalida == 0) {
                        return;
                }

                switch (codigoSalida) {

                        case 1:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.DATOS_INVALIDOS,
                                                mensajeSalida);

                        case 2:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.NO_ENCONTRADO,
                                                mensajeSalida);

                        case 3:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.OPERACION_NO_REALIZADA,
                                                mensajeSalida);

                        case 4:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.YA_EXISTE,
                                                mensajeSalida);

                        case 5:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.NO_ENCONTRADO,
                                                mensajeSalida);

                        case 6:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.DATOS_INVALIDOS,
                                                mensajeSalida);

                        default:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.ERROR_BD,
                                                mensajeSalida);
                }
        }

        /*
         * VALIDAR RESULTADO GESTIONAR ROL
         */
        private void validarResultadoGestionRol(
                        int codigoSalida,
                        String mensajeSalida) {

                if (codigoSalida == 0) {
                        return;
                }

                switch (codigoSalida) {

                        case 1:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.DATOS_INVALIDOS,
                                                mensajeSalida);

                        case 2:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.DATOS_INVALIDOS,
                                                mensajeSalida);

                        case 3:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.NO_ENCONTRADO,
                                                mensajeSalida);

                        case 4:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.NO_ENCONTRADO,
                                                mensajeSalida);

                        case 5:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.OPERACION_NO_REALIZADA,
                                                mensajeSalida);

                        case 6:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.NO_ENCONTRADO,
                                                mensajeSalida);

                        case 7:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.NO_ENCONTRADO,
                                                mensajeSalida);

                        case 8:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.OPERACION_NO_REALIZADA,
                                                mensajeSalida);

                        case 9:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.YA_EXISTE,
                                                mensajeSalida);

                        case 10:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.NO_ENCONTRADO,
                                                mensajeSalida);

                        default:
                                throw new ErrorOperacionException(
                                                TipoRespuesta.ERROR_BD,
                                                mensajeSalida);
                }
        }

        /*
         * CONVERTIR FECHA
         */
        private java.time.LocalDateTime convertirFecha(
                        Timestamp timestamp) {

                return timestamp != null
                                ? timestamp.toLocalDateTime()
                                : null;
        }
}