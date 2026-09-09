package com.GIU.BACKEND.repository;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.GIU.BACKEND.model.RolResponseDTO;
import com.GIU.BACKEND.utils.Constantes;
import com.GIU.BACKEND.utils.utilsBD;

import oracle.jdbc.OracleTypes;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@Repository
public class GestionRolesRepository {

    private static final Logger logger =
            LogManager.getLogger(Constantes.APLICACION);

    public List<RolResponseDTO> obtenerRoles(Long apliId) {

        List<RolResponseDTO> roles = new ArrayList<>();

        try (Connection conn = utilsBD.obtenerConexion(
                Constantes.TIPO_CONEXION_JDBC,
                Constantes.NOMBRE_BD_LOCAL)) {

            String sql =
                    "{ ? = call PKG_GIU_GESTION_ROLES.FN_OBTENER_ROL("
                    + "?, ?, ?) }";

            try (CallableStatement stmt = conn.prepareCall(sql)) {

                stmt.registerOutParameter(1, OracleTypes.CURSOR);

                stmt.setNull(2, Types.NUMERIC);

                stmt.setLong(3, apliId);

                stmt.setString(4, "ACTIVO");

                stmt.execute();

                try (ResultSet rs =
                        (ResultSet) stmt.getObject(1)) {

                    while (rs.next()) {

                        RolResponseDTO rol = new RolResponseDTO();

                        rol.setId(
                                rs.getLong("ID"));

                        rol.setApliId(
                                rs.getLong("APLI_ID"));

                        rol.setNombre(
                                rs.getString("NOMBRE"));

                        rol.setDescripcion(
                                rs.getString("DESCRIPCION"));

                        rol.setEstado(
                                rs.getString("ESTADO"));

                        rol.setFechaCreacion(
                                convertirFecha(
                                        rs.getTimestamp("FECHA_CREACION")));

                        rol.setUsuarioCreacion(
                                rs.getString("USUARIO_CREACION"));

                        rol.setFechaModificacion(
                                convertirFecha(
                                        rs.getTimestamp("FECHA_MODIFICACION")));

                        rol.setUsuarioModificacion(
                                rs.getString("USUARIO_MODIFICACION"));

                        roles.add(rol);
                    }
                }
            }

        } catch (Exception e) {

            logger.error(
                    "Error consultando roles de la aplicación: {}",
                    apliId,
                    e);

            throw new RuntimeException(
                    "Error consultando roles de la aplicación",
                    e);
        }

        return roles;
    }

    private LocalDateTime convertirFecha(Timestamp timestamp) {

        return timestamp != null
                ? timestamp.toLocalDateTime()
                : null;
    }
}