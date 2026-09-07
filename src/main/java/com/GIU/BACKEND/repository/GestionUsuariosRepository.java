package com.GIU.BACKEND.repository;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.GIU.BACKEND.model.UsuarioAplicacionDTO;
import com.GIU.BACKEND.utils.Constantes;
import com.GIU.BACKEND.utils.Propiedades;
import com.GIU.BACKEND.utils.utilsBD;

import oracle.jdbc.OracleTypes;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Repository;

@Repository
public class GestionUsuariosRepository {

    private static final Logger logger =
            LogManager.getLogger("GIU");


        /*PL- Obtener usuarios por aplicación */
    public List<UsuarioAplicacionDTO> obtenerUsuarioXAplicacion(
            Long apliId,
            String estado) {

        List<UsuarioAplicacionDTO> usuarios = new ArrayList<>();

        try (Connection conn = utilsBD.obtenerConexion()) {


            if (conn == null) {
                logger.warn("No fue posible establecer conexion con la Base de Datos.");
                return usuarios;
            }

            String sql =
                    "{ ? = call PKG_GIU_GESTION_USUARIOS.FN_OBTENER_USUARIO_X_APLICACION(?, ?, ?, ?) }";

            try (CallableStatement stmt = conn.prepareCall(sql)) {

                // Retorno SYS_REFCURSOR
                stmt.registerOutParameter(1, OracleTypes.CURSOR);

                // Parámetros de entrada
                stmt.setNull(2, java.sql.Types.VARCHAR);
                stmt.setObject(3, apliId);
                stmt.setString(4, estado);
                stmt.setNull(5, java.sql.Types.VARCHAR);

                stmt.execute();

                try (ResultSet rs =
                             (ResultSet) stmt.getObject(1)) {

                    while (rs.next()) {

                        UsuarioAplicacionDTO usuario =
                                new UsuarioAplicacionDTO();

                        usuario.setId(rs.getLong("ID"));
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
                        Timestamp fechaCreacion = 
                                rs.getTimestamp("FECHA_CREACION");
                        usuario.setFechaCreacion(
                                fechaCreacion != null ? fechaCreacion.toLocalDateTime() : null);
                        usuario.setUsuarioCreacion(
                                rs.getString("USUARIO_CREACION"));
                        Timestamp fechaModificacion = 
                                rs.getTimestamp("FECHA_MODIFICACION");
                        usuario.setFechaModificacion(
                                fechaModificacion != null ? fechaModificacion.toLocalDateTime() : null);
                        usuario.setUsuarioModificacion(
                                rs.getString("USUARIO_MODIFICACION"));

                        usuario.setCodigoApli(
                                rs.getString("CODIGO_APLI"));
                        usuario.setNombreApli(
                                rs.getString("NOMBRE_APLI"));
                        usuario.setEstadoApli(
                                rs.getString("ESTADO_APLI"));

                        usuario.setIdRol(
                                rs.getObject("ID_ROL", Long.class));
                        usuario.setNombreRol(
                                rs.getString("NOMBRE_ROL"));
                        Timestamp fechaInRol = 
                                rs.getTimestamp("FECHA_IN_ROL");
                        usuario.setFechaInRol(
                                fechaInRol != null ? fechaInRol.toLocalDateTime() : null);
                        Timestamp fechaFinRol = 
                                rs.getTimestamp("FECHA_FIN_ROL");
                        usuario.setFechaFinRol(
                                fechaFinRol != null ? fechaFinRol.toLocalDateTime() : null);

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

    /* PL- Obtener informacion de usuarios  */
    
}
