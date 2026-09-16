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

import oracle.jdbc.OracleTypes;

import org.springframework.stereotype.Repository;

import com.giu.model.gestionAplicaciones.AdministradorAplicacionResponseDTO;
import com.giu.model.gestionAplicaciones.AplicacionResponseDTO;
import com.giu.model.gestionAplicaciones.GestionarAdministradorRequest;
import com.giu.utils.Constantes;
import com.giu.utils.FechaUtils;
import com.giu.utils.utilsBD;

@Repository
public class GestionAplicacionesRepository {

    private static final Logger logger = LogManager.getLogger(GestionAplicacionesRepository.class);

    // Consulta una aplicación -> FN_OBTENER_APLICACION
    public List<AplicacionResponseDTO> obtenerAplicacion(
            String codigo,
            String estado) {

        String sql = "{ ? = call PKG_GIU_GESTION_APLICACIONES.FN_OBTENER_APLICACION(?, ?) }";

        List<AplicacionResponseDTO> aplicaciones = new ArrayList<>();

        try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                CallableStatement stmt = conn.prepareCall(sql)) {

            stmt.registerOutParameter(1, OracleTypes.CURSOR);
            stmt.setString(2, codigo);
            stmt.setString(3, estado);

            stmt.execute();

            try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                while (rs.next()) {

                    AplicacionResponseDTO aplicacion = new AplicacionResponseDTO();

                    aplicacion.setId(rs.getLong("ID"));
                    aplicacion.setNombre(rs.getString("NOMBRE"));
                    aplicacion.setCodigo(rs.getString("CODIGO"));
                    aplicacion.setDescripcion(rs.getString("DESCRIPCION"));
                    aplicacion.setEstado(rs.getString("ESTADO"));
                    aplicacion.setAdministracion(rs.getString("ADMINISTRACION"));

                    if (rs.getTimestamp("FECHA_CREACION") != null) {
                        aplicacion.setFechaCreacion(
                                rs.getTimestamp("FECHA_CREACION").toLocalDateTime());
                    }

                    aplicacion.setUsuarioCreacion(rs.getString("USUARIO_CREACION"));

                    if (rs.getTimestamp("FECHA_MODIFICACION") != null) {
                        aplicacion.setFechaModificacion(
                                rs.getTimestamp("FECHA_MODIFICACION").toLocalDateTime());
                    }

                    aplicacion.setUsuarioModificacion(rs.getString("USUARIO_MODIFICACION"));
                    aplicaciones.add(aplicacion);
                }
            }

        } catch (Exception e) {

            logger.error("Error al consultar aplicación", e);

            throw new RuntimeException("Error consultando aplicación", e);
        }

        return aplicaciones;
    }

    // Consulta los administradores asociados a una aplicación ->
    // FN_OBTENER_ADMINISTRADOR_APLICACION
    public List<AdministradorAplicacionResponseDTO> obtenerAdministradorAplicacion(
            String usuarioRed,
            Long apliId) {

        String sql = "{ ? = call PKG_GIU_GESTION_APLICACIONES.FN_OBTENER_ADMINISTRADOR_APLICACION(?, ?) }";

        List<AdministradorAplicacionResponseDTO> administradores = new ArrayList<>();

        try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                CallableStatement stmt = conn.prepareCall(sql)) {

            // Retorno de la función
            stmt.registerOutParameter(1, OracleTypes.CURSOR);

            // Parámetros de entrada
            stmt.setString(2, usuarioRed);

            if (apliId != null) {
                stmt.setLong(3, apliId);
            } else {
                stmt.setNull(3, Types.NUMERIC);
            }

            stmt.execute();

            try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                while (rs.next()) {

                    AdministradorAplicacionResponseDTO administrador = new AdministradorAplicacionResponseDTO();

                    administrador.setId(rs.getLong(1));
                    administrador.setApliId(rs.getLong(2));

                    Timestamp fechaIn = rs.getTimestamp(3);
                    if (fechaIn != null) {
                        administrador.setFechaIn(
                                fechaIn.toLocalDateTime());
                    }

                    Timestamp fechaFin = rs.getTimestamp(4);
                    if (fechaFin != null) {
                        administrador.setFechaFin(
                                fechaFin.toLocalDateTime());
                    }

                    Timestamp fechaCreacion = rs.getTimestamp(5);
                    if (fechaCreacion != null) {
                        administrador.setFechaCreacion(
                                fechaCreacion.toLocalDateTime());
                    }

                    administrador.setUsuarioCreacion(rs.getString(6));

                    Timestamp fechaModificacion = rs.getTimestamp(7);
                    if (fechaModificacion != null) {
                        administrador.setFechaModificacion(
                                fechaModificacion.toLocalDateTime());
                    }

                    administrador.setUsuarioModificacion(
                            rs.getString(8));

                    // Datos del usuario
                    administrador.setUsuarioId(rs.getLong(9));
                    administrador.setUsuarioRed(rs.getString(10));
                    administrador.setNombre(rs.getString(11));
                    administrador.setCorreo(rs.getString(12));
                    administrador.setNumeroIdentificacion(
                            rs.getString(13));
                    administrador.setEstadoUsuario(
                            rs.getString(14));
                    administrador.setEsSuperAdmin(
                            rs.getInt(15));

                    Timestamp fechaCreacionUsuario = rs.getTimestamp(16);

                    if (fechaCreacionUsuario != null) {
                        administrador.setFechaCreacionUsuario(
                                fechaCreacionUsuario.toLocalDateTime());
                    }

                    administrador.setUsuarioCreacionUsuario(
                            rs.getString(17));

                    Timestamp fechaModificacionUsuario = rs.getTimestamp(18);

                    if (fechaModificacionUsuario != null) {
                        administrador.setFechaModificacionUsuario(
                                fechaModificacionUsuario.toLocalDateTime());
                    }

                    administrador.setUsuarioModificacionUsuario(
                            rs.getString(19));

                    administradores.add(administrador);
                }
            }

        } catch (Exception e) {

            logger.error(
                    "Error al consultar administrador de aplicación",
                    e);

            throw new RuntimeException(
                    "Error consultando administrador de aplicación",
                    e);
        }

        return administradores;
    }

    // Crea una aplicación -> PRC_CREAR_APLICACION
    public AplicacionResponseDTO crearAplicacion(
            String codigo,
            String nombre,
            String descripcion,
            String administracion,
            String usuarioCreacion) {

        String sql = "{ call PKG_GIU_GESTION_APLICACIONES.PRC_CREAR_APLICACION(?, ?, ?, ?, ?, ?, ?, ?) }";

        try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                CallableStatement stmt = conn.prepareCall(sql)) {

            stmt.setString(1, codigo);
            stmt.setString(2, nombre);
            stmt.setString(3, descripcion);
            stmt.setString(4, administracion);
            stmt.setString(5, usuarioCreacion);

            stmt.registerOutParameter(6, OracleTypes.CURSOR);
            stmt.registerOutParameter(7, OracleTypes.NUMBER);
            stmt.registerOutParameter(8, OracleTypes.VARCHAR);

            stmt.execute();

            int codigoSalida = stmt.getInt(7);
            String mensajeSalida = stmt.getString(8);

            utilsBD.validarResultado(codigoSalida, mensajeSalida);

            try (ResultSet rs = (ResultSet) stmt.getObject(6)) {

                if (rs != null && rs.next()) {

                    AplicacionResponseDTO aplicacion = new AplicacionResponseDTO();

                    aplicacion.setId(rs.getLong("ID"));
                    aplicacion.setNombre(rs.getString("NOMBRE"));
                    aplicacion.setCodigo(rs.getString("CODIGO"));
                    aplicacion.setDescripcion(rs.getString("DESCRIPCION"));
                    aplicacion.setEstado(rs.getString("ESTADO"));
                    aplicacion.setAdministracion(rs.getString("ADMINISTRACION"));
                    aplicacion.setFechaCreacion(FechaUtils.convertirFecha(rs.getTimestamp("FECHA_CREACION")));
                    aplicacion.setUsuarioCreacion(rs.getString("USUARIO_CREACION"));
                    aplicacion.setFechaModificacion(FechaUtils.convertirFecha(rs.getTimestamp("FECHA_MODIFICACION")));
                    aplicacion.setUsuarioModificacion(rs.getString("USUARIO_MODIFICACION"));
                    return aplicacion;
                }
            }

            return null;

        } catch (Exception e) {

            logger.error("Error al crear aplicación", e);

            throw new RuntimeException("Error creando aplicación", e);
        }
    }

    // Modifica una aplicación -> PRC_MODIFICAR_APLICACION
    public AplicacionResponseDTO modificarAplicacion(
            Long id,
            String nombre,
            String codigo,
            String descripcion,
            String estado,
            String administracion,
            String usuarioModificacion) {

        String sql = "{ call PKG_GIU_GESTION_APLICACIONES.PRC_MODIFICAR_APLICACION(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) }";

        try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                CallableStatement stmt = conn.prepareCall(sql)) {
            stmt.setLong(1, id);
            stmt.setString(2, nombre);
            stmt.setString(3, codigo);
            stmt.setString(4, descripcion);
            stmt.setString(5, estado);
            stmt.setString(6, administracion);
            stmt.setString(7, usuarioModificacion);

            stmt.registerOutParameter(8, OracleTypes.CURSOR);
            stmt.registerOutParameter(9, OracleTypes.NUMBER);
            stmt.registerOutParameter(10, OracleTypes.VARCHAR);

            stmt.execute();

            int codigoSalida = stmt.getInt(9);
            String mensajeSalida = stmt.getString(10);
            utilsBD.validarResultado(codigoSalida, mensajeSalida);

            try (ResultSet rs = (ResultSet) stmt.getObject(8)) {

                if (rs != null && rs.next()) {

                    AplicacionResponseDTO aplicacion = new AplicacionResponseDTO();

                    aplicacion.setId(rs.getLong("ID"));
                    aplicacion.setNombre(rs.getString("NOMBRE"));
                    aplicacion.setCodigo(rs.getString("CODIGO"));
                    aplicacion.setDescripcion(rs.getString("DESCRIPCION"));
                    aplicacion.setEstado(rs.getString("ESTADO"));
                    aplicacion.setAdministracion(rs.getString("ADMINISTRACION"));
                    aplicacion.setFechaCreacion(FechaUtils.convertirFecha(rs.getTimestamp("FECHA_CREACION")));
                    aplicacion.setUsuarioCreacion(rs.getString("USUARIO_CREACION"));
                    aplicacion.setFechaModificacion(FechaUtils.convertirFecha(rs.getTimestamp("FECHA_MODIFICACION")));
                    aplicacion.setUsuarioModificacion(rs.getString("USUARIO_MODIFICACION"));

                    return aplicacion;
                }
            }
            return null;

        } catch (Exception e) {

            logger.error("Error al modificar aplicación", e);

            throw new RuntimeException("Error modificando aplicación", e);
        }
    }

    // Gestionar un administrador de una aplicación -> PRC_GESTIONAR_ADMINISTRADOR

    public AdministradorAplicacionResponseDTO gestionarAdministrador(
            GestionarAdministradorRequest request,
            String usuarioModificacion,
            Integer operacion) {

        String sql = "{ call PKG_GIU_GESTION_APLICACIONES.PRC_GESTIONAR_ADMINISTRADOR(?, ?, ?, ?, ?, ?, ?, ?, ?) }";

        try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU)) {

            try (CallableStatement stmt = conn.prepareCall(sql)) {

                stmt.setString(1, request.getUsuarioRed());
                stmt.setLong(2, request.getApliId());
                stmt.setInt(3, operacion);

                if (request.getFechaIn() != null) {
                    stmt.setTimestamp(4, Timestamp.valueOf(request.getFechaIn()));
                } else {
                    stmt.setNull(4, Types.TIMESTAMP);
                }

                if (request.getFechaFin() != null) {
                    stmt.setTimestamp(5, Timestamp.valueOf(request.getFechaFin()));
                } else {
                    stmt.setNull(5, Types.TIMESTAMP);
                }

                stmt.setString(6, usuarioModificacion);

                stmt.registerOutParameter(7, OracleTypes.CURSOR);
                stmt.registerOutParameter(8, OracleTypes.NUMBER);
                stmt.registerOutParameter(9, OracleTypes.VARCHAR);

                stmt.execute();

                int codigoSalida = stmt.getInt(8);
                String mensajeSalida = stmt.getString(9);

                utilsBD.validarResultado(codigoSalida, mensajeSalida);

                // Obtener resultado
                try (ResultSet rs = (ResultSet) stmt.getObject(7)) {

                    if (rs != null && rs.next()) {

                        AdministradorAplicacionResponseDTO administrador = new AdministradorAplicacionResponseDTO();

                        administrador.setId(rs.getLong(1));
                        administrador.setApliId(rs.getLong(2));
                        administrador.setFechaIn(
                                FechaUtils.convertirFecha(rs.getTimestamp(3)));
                        administrador.setFechaFin(
                                FechaUtils.convertirFecha(rs.getTimestamp(4)));
                        administrador.setFechaCreacion(
                                FechaUtils.convertirFecha(rs.getTimestamp(5)));
                        administrador.setUsuarioCreacion(rs.getString(6));
                        administrador.setFechaModificacion(
                                FechaUtils.convertirFecha(rs.getTimestamp(7)));
                        administrador.setUsuarioModificacion(rs.getString(8));

                        administrador.setUsuarioId(rs.getLong(9));
                        administrador.setUsuarioRed(rs.getString(10));
                        administrador.setNombre(rs.getString(11));
                        administrador.setCorreo(rs.getString(12));
                        administrador.setNumeroIdentificacion(rs.getString(13));
                        administrador.setEstadoUsuario(rs.getString(14));
                        administrador.setEsSuperAdmin(rs.getInt(15));
                        administrador.setFechaCreacionUsuario(
                                FechaUtils.convertirFecha(rs.getTimestamp(16)));
                        administrador.setUsuarioCreacionUsuario(rs.getString(17));
                        administrador.setFechaModificacionUsuario(
                                FechaUtils.convertirFecha(rs.getTimestamp(18)));
                        administrador.setUsuarioModificacionUsuario(rs.getString(19));

                        return administrador;
                    }
                }

                return null;
            }

        } catch (Exception e) {

            logger.error(
                    "Error al gestionar administrador de aplicación para usuario {} en aplicación {}",
                    request.getUsuarioRed(),
                    request.getApliId(),
                    e);

            throw new RuntimeException(
                    "Error gestionando administrador de aplicación", e);
        }
    }

}
