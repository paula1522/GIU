package com.giu.repository;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.sql.Array;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import oracle.jdbc.OracleConnection;
import oracle.jdbc.OracleTypes;

import org.springframework.stereotype.Repository;

import com.giu.model.gestionRoles.CrearRolRequestDTO;
import com.giu.model.gestionRoles.GestionarRecursosRolRequestDTO;
import com.giu.model.gestionRoles.ModificarRolRequestDTO;
import com.giu.model.gestionRoles.RecursosRolResponseDTO;
import com.giu.model.gestionRoles.RolResponseDTO;
import com.giu.utils.BooleanUtils;
import com.giu.utils.Constantes;
import com.giu.utils.FechaUtils;
import com.giu.utils.Propiedades;
import com.giu.utils.utilsBD;

@Repository
public class GestionRolesRepository {

        private static final Logger logger = LogManager.getLogger(GestionRolesRepository.class);

        // Consulta los roles asociados a una aplicación -> FN_OBTENER_ROL
        public List<RolResponseDTO> obtenerRoles(
                        Long rolId,
                        Long apliId,
                        String estado) {

                logger.debug("obtenerRoles - ejecutando FN_OBTENER_ROL. rolId={}, apliId={}, estado={}",
                                rolId,
                                apliId,
                                estado);

                String sql = Propiedades.getInstance().getPropiedad(
                                Constantes.SQL_ROLES_OBTENER);

                List<RolResponseDTO> roles = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU);
                                CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.registerOutParameter(
                                        1,
                                        OracleTypes.CURSOR);

                        if (rolId != null) {
                                stmt.setLong(2, rolId);
                        } else {
                                stmt.setNull(2, Types.NUMERIC);
                        }

                        if (apliId != null) {
                                stmt.setLong(3, apliId);
                        } else {
                                stmt.setNull(3, Types.NUMERIC);
                        }

                        if (estado != null) {
                                stmt.setString(4, estado);
                        } else {
                                stmt.setNull(4, Types.VARCHAR);
                        }

                        stmt.execute();

                        try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                while (rs.next()) {

                                        RolResponseDTO rol = new RolResponseDTO();

                                        rol.setId(rs.getLong("ID"));

                                        rol.setApliId(rs.getLong("APLI_ID"));

                                        rol.setNombre(rs.getString("NOMBRE"));

                                        rol.setDescripcion(rs.getString("DESCRIPCION"));

                                        rol.setEstado(rs.getString("ESTADO"));

                                        rol.setFechaCreacion(FechaUtils.convertirFecha(
                                                        rs.getTimestamp(
                                                                        "FECHA_CREACION")));

                                        rol.setUsuarioCreacion(rs.getString(
                                                        "USUARIO_CREACION"));

                                        rol.setFechaModificacion(FechaUtils.convertirFecha(
                                                        rs.getTimestamp(
                                                                        "FECHA_MODIFICACION")));

                                        rol.setUsuarioModificacion(rs.getString(
                                                        "USUARIO_MODIFICACION"));

                                        roles.add(rol);
                                }
                        }

                        logger.debug("obtenerRoles - registros mapeados. total={}",
                                        roles.size());

                } catch (Exception e) {

                        logger.error("obtenerRoles - error. rolId={}, apliId={}, estado={}",
                                        rolId,
                                        apliId,
                                        estado, e);

                        throw new RuntimeException("Error consultando roles de la aplicación", e);
                }

                return roles;
        }

        // Consulta los recursos asociados a un rol -> FN_RECURSOS_ROL
        public List<RecursosRolResponseDTO> obtenerRecursosRol(Long rolId) {

                logger.debug("obtenerRecursosRol - ejecutando FN_RECURSOS_ROL. rolId={}",
                                rolId);

                String sql = Propiedades.getInstance().getPropiedad(Constantes.SQL_ROLES_RECURSOS);

                List<RecursosRolResponseDTO> recursos = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                                CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.registerOutParameter(1, OracleTypes.CURSOR);

                        stmt.setLong(2, rolId);

                        stmt.execute();

                        try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                while (rs.next()) {

                                        RecursosRolResponseDTO recurso = new RecursosRolResponseDTO();

                                        recurso.setId(rs.getLong("ID"));
                                        recurso.setRolId(rs.getLong("ROL_ID"));
                                        recurso.setRecuId(rs.getLong("RECU_ID"));
                                        recurso.setRecuCodigo(rs.getString("RECU_CODIGO"));
                                        recurso.setRecuNombre(rs.getString("RECU_NOMBRE"));
                                        recurso.setRecuTipo(rs.getString("RECU_TIPO"));
                                        recurso.setRecuEstado(rs.getString("RECU_ESTADO"));

                                        recursos.add(recurso);
                                }
                        }

                        logger.debug("obtenerRecursosRol - registros mapeados. total={}",
                                        recursos.size());

                } catch (Exception e) {

                        logger.error("obtenerRecursosRol - error. rolId={}",
                                        rolId, e);

                        throw new RuntimeException("Error consultando recursos del rol", e);
                }

                return recursos;
        }

        // Crea un rol -> PRC_CREAR_ROL
        public RolResponseDTO crearRol(
                        Long apliId,
                        CrearRolRequestDTO request,
                        String usuarioCreacion) {

                logger.debug("crearRol - ejecutando PRC_CREAR_ROL. apliId={}, usuarioCreacion={}",
                                apliId,
                                usuarioCreacion);

                String sql = Propiedades.getInstance().getPropiedad(Constantes.SQL_ROLES_CREAR);

                try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                                CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.setLong(1, apliId);
                        stmt.setString(2, request.getNombre());
                        stmt.setString(3, request.getDescripcion());
                        stmt.setString(4, usuarioCreacion);

                        stmt.registerOutParameter(5, OracleTypes.CURSOR);
                        stmt.registerOutParameter(6, OracleTypes.NUMBER);
                        stmt.registerOutParameter(7, OracleTypes.VARCHAR);

                        stmt.execute();

                        int codigoSalida = stmt.getInt(6);
                        String mensajeSalida = stmt.getString(7);

                        logger.debug("crearRol - PL respondió. codigo={}, mensaje={}",
                                        codigoSalida,
                                        mensajeSalida);

                        utilsBD.validarResultado(codigoSalida, mensajeSalida);

                        try (ResultSet rs = (ResultSet) stmt.getObject(5)) {

                                if (rs != null && rs.next()) {

                                        RolResponseDTO rol = new RolResponseDTO();

                                        rol.setId(rs.getLong("ID"));
                                        rol.setApliId(rs.getLong("APLI_ID"));
                                        rol.setNombre(rs.getString("NOMBRE"));
                                        rol.setDescripcion(rs.getString("DESCRIPCION"));
                                        rol.setEstado(rs.getString("ESTADO"));
                                        rol.setFechaCreacion(
                                                        FechaUtils.convertirFecha(rs.getTimestamp("FECHA_CREACION")));
                                        rol.setUsuarioCreacion(rs.getString("USUARIO_CREACION"));
                                        rol.setFechaModificacion(FechaUtils
                                                        .convertirFecha(rs.getTimestamp("FECHA_MODIFICACION")));
                                        rol.setUsuarioModificacion(rs.getString("USUARIO_MODIFICACION"));

                                        return rol;
                                }
                        }

                        logger.warn("crearRol - el cursor vino vacío. apliId={}", apliId);

                        return null;

                } catch (Exception e) {

                        logger.error("crearRol - error ejecutando PL. apliId={}", apliId, e);

                        throw new RuntimeException("Error creando rol", e);
                }
        }

        // Modifica un rol -> PRC_MODIFICAR_ROL
        public RolResponseDTO modificarRol(
                        Long rolId,
                        Long apliId,
                        ModificarRolRequestDTO request,
                        String usuarioModificacion) {

                logger.debug("modificarRol - ejecutando PRC_MODIFICAR_ROL. rolId={}, apliId={}, usuarioModificacion={}",
                                rolId,
                                apliId,
                                usuarioModificacion);

                String sql = Propiedades.getInstance().getPropiedad(Constantes.SQL_ROLES_MODIFICAR);

                try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                                CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.setLong(1, rolId);
                        stmt.setLong(2, apliId);
                        stmt.setString(3, request.getNombre());
                        stmt.setString(4, request.getDescripcion());
                        stmt.setString(5, BooleanUtils.booleanToEstado(request.getEstado()));
                        stmt.setString(6, usuarioModificacion);

                        stmt.registerOutParameter(7, OracleTypes.CURSOR);
                        stmt.registerOutParameter(8, OracleTypes.NUMBER);
                        stmt.registerOutParameter(9, OracleTypes.VARCHAR);

                        stmt.execute();

                        int codigoSalida = stmt.getInt(8);
                        String mensajeSalida = stmt.getString(9);

                        logger.debug("modificarRol - PL respondió. codigo={}, mensaje={}",
                                        codigoSalida,
                                        mensajeSalida);

                        utilsBD.validarResultado(codigoSalida, mensajeSalida);

                        try (ResultSet rs = (ResultSet) stmt.getObject(7)) {

                                if (rs != null && rs.next()) {

                                        RolResponseDTO rol = new RolResponseDTO();

                                        rol.setId(rs.getLong("ID"));
                                        rol.setApliId(rs.getLong("APLI_ID"));
                                        rol.setNombre(rs.getString("NOMBRE"));
                                        rol.setDescripcion(rs.getString("DESCRIPCION"));
                                        rol.setEstado(rs.getString("ESTADO"));
                                        rol.setFechaCreacion(
                                                        FechaUtils.convertirFecha(rs.getTimestamp("FECHA_CREACION")));
                                        rol.setUsuarioCreacion(rs.getString("USUARIO_CREACION"));
                                        rol.setFechaModificacion(FechaUtils
                                                        .convertirFecha(rs.getTimestamp("FECHA_MODIFICACION")));
                                        rol.setUsuarioModificacion(rs.getString("USUARIO_MODIFICACION"));

                                        return rol;
                                }
                        }

                        logger.warn("modificarRol - el cursor vino vacío. rolId={}", rolId);

                        return null;

                } catch (Exception e) {

                        logger.error("modificarRol - error ejecutando PL. rolId={}, apliId={}", rolId, apliId, e);

                        throw new RuntimeException("Error modificando rol", e);
                }
        }

        // Gestiona los recursos de un rol -> PRC_GESTIONAR_RECURSOS_ROL
        public List<RecursosRolResponseDTO> gestionarRecursosRol(
                        GestionarRecursosRolRequestDTO request,
                        Long rolId,
                        Integer operacion,
                        String usuarioModificacion) {

                logger.debug("gestionarRecursosRol - ejecutando PRC_GESTIONAR_RECURSOS_ROL. rolId={}, operacion={}, usuarioModificacion={}",
                                rolId,
                                operacion,
                                usuarioModificacion);

                String sql = Propiedades.getInstance().getPropiedad(Constantes.SQL_ROLES_GESTIONAR_RECURSOS);

                try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                                CallableStatement stmt = conn.prepareCall(sql)) {

                        OracleConnection oracleConnection = conn.unwrap(OracleConnection.class);

                        Array recursosArray = oracleConnection.createOracleArray("SERCON_EAF.TP_GIU_RECURSOS",
                                        request.getRecursos().toArray(new Long[0]));

                        stmt.setArray(1, recursosArray);

                        stmt.setLong(2, rolId);
                        stmt.setInt(3, operacion);
                        stmt.setString(4, usuarioModificacion);

                        stmt.registerOutParameter(5, OracleTypes.CURSOR);
                        stmt.registerOutParameter(6, OracleTypes.NUMBER);
                        stmt.registerOutParameter(7, OracleTypes.VARCHAR);

                        stmt.execute();

                        int codigoSalida = stmt.getInt(6);
                        String mensajeSalida = stmt.getString(7);

                        logger.debug("gestionarRecursosRol - PL respondió. codigo={}, mensaje={}",
                                        codigoSalida,
                                        mensajeSalida);

                        utilsBD.validarResultado(codigoSalida, mensajeSalida);

                        List<RecursosRolResponseDTO> recursos = new ArrayList<>();

                        try (ResultSet rs = (ResultSet) stmt.getObject(5)) {

                                while (rs != null && rs.next()) {

                                        RecursosRolResponseDTO recurso = new RecursosRolResponseDTO();

                                        recurso.setId(rs.getLong("ID"));
                                        recurso.setRolId(rs.getLong("ROL_ID"));
                                        recurso.setRecuId(rs.getLong("RECU_ID"));
                                        recurso.setRecuCodigo(rs.getString("RECU_CODIGO"));
                                        recurso.setRecuNombre(rs.getString("RECU_NOMBRE"));
                                        recurso.setRecuTipo(rs.getString("RECU_TIPO"));
                                        recurso.setRecuEstado(rs.getString("RECU_ESTADO"));

                                        recursos.add(recurso);
                                }
                        }

                        return recursos;

                } catch (Exception e) {

                        logger.error("gestionarRecursosRol - error ejecutando PL. rolId={}, operacion={}", rolId,
                                        operacion, e);

                        throw new RuntimeException("Error gestionando recursos del rol", e);
                }
        }
}