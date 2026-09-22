package com.giu.repository;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Repository;

import oracle.jdbc.OracleTypes;

import com.giu.model.gestionRecursos.CrearRecursoRequestDTO;
import com.giu.model.gestionRecursos.ModificarRecursoRequestDTO;
import com.giu.model.gestionRecursos.RecursoResponseDTO;
import com.giu.model.gestionRecursos.RolRecursoResponseDTO;
import com.giu.model.gestionRecursos.RecursoUsuarioResponseDTO;
import com.giu.utils.Constantes;
import com.giu.utils.Propiedades;
import com.giu.utils.utilsBD;

@Repository
public class GestionRecursosRepository {

        private static final Logger logger = LogManager.getLogger(GestionRecursosRepository.class);

        // Consulta los recursos asociados a una aplicación -> FN_OBTENER_RECURSO
        public List<RecursoResponseDTO> obtenerRecurso(
                        Long apliId,
                        String estado) {

                logger.debug("obtenerRecurso - ejecutando FN_OBTENER_RECURSO. apliId={}, estado={}",
                                apliId,
                                estado);

                String sql = Propiedades.getInstance()
                                .getPropiedad(Constantes.SQL_RECURSOS_OBTENER);

                List<RecursoResponseDTO> recursos = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                                CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.registerOutParameter(1, OracleTypes.CURSOR);

                        if (apliId != null) {
                                stmt.setLong(2, apliId);
                        } else {
                                stmt.setNull(2, Types.NUMERIC);
                        }

                        stmt.setString(3, estado);

                        stmt.execute();

                        try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                while (rs.next()) {

                                        RecursoResponseDTO recurso = new RecursoResponseDTO();

                                        recurso.setId(rs.getLong("ID"));
                                        recurso.setApliId(rs.getLong("APLI_ID"));
                                        recurso.setRecuIdPadre(rs.getLong("RECU_ID_PADRE"));
                                        recurso.setCodigo(rs.getString("CODIGO"));
                                        recurso.setNombre(rs.getString("NOMBRE"));
                                        recurso.setDescripcion(rs.getString("DESCRIPCION"));
                                        recurso.setTipo(rs.getString("TIPO"));
                                        recurso.setEstado(rs.getString("ESTADO"));

                                        recursos.add(recurso);
                                }
                        }

                        logger.debug("obtenerRecurso - registros mapeados. total={}",
                                        recursos.size());

                } catch (Exception e) {

                        logger.error("obtenerRecurso - error. apliId={}, estado={}",
                                        apliId,
                                        estado, e);

                        throw new RuntimeException("Error consultando recursos", e);
                }

                return recursos;
        }

        // Consulta los roles asociados a un recurso -> FN_ROLES_RECURSO
        public List<RolRecursoResponseDTO> obtenerRolesRecurso(Long recuId) {

                logger.debug("obtenerRolesRecurso - ejecutando FN_ROLES_RECURSO. recuId={}",
                                recuId);

                String sql = Propiedades.getInstance().getPropiedad(Constantes.SQL_ROLES_RECURSO);
                List<RolRecursoResponseDTO> roles = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                                CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.registerOutParameter(1, OracleTypes.CURSOR);

                        if (recuId != null) {
                                stmt.setLong(2, recuId);
                        } else {
                                stmt.setNull(2, Types.NUMERIC);
                        }

                        stmt.execute();

                        try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                while (rs.next()) {

                                        RolRecursoResponseDTO rol = new RolRecursoResponseDTO();

                                        rol.setId(rs.getLong("ID"));
                                        rol.setRecuId(rs.getLong("RECU_ID"));
                                        rol.setRolId(rs.getLong("ROL_ID"));
                                        rol.setApliId(rs.getLong("APLI_ID"));
                                        rol.setRolNombre(rs.getString("ROL_NOMBRE"));
                                        rol.setRolDescripcion(rs.getString("ROL_DESCRIPCION"));
                                        rol.setRolEstado(rs.getString("ROL_ESTADO"));

                                        roles.add(rol);
                                }
                        }

                        logger.debug("obtenerRolesRecurso - registros mapeados. total={}",
                                        roles.size());

                } catch (Exception e) {

                        logger.error("obtenerRolesRecurso - error. recuId={}",
                                        recuId,
                                        e);

                        throw new RuntimeException("Error consultando roles del recurso", e);
                }

                return roles;
        }

        // Consulta los recursos asignados a un usuario -> FN_OBTENER_RECURSO_USUARIO
        public List<RecursoUsuarioResponseDTO> obtenerRecursoUsuario(
                        String usuarioRed,
                        Long apliId) {

                logger.debug("obtenerRecursoUsuario - ejecutando FN_OBTENER_RECURSO_USUARIO. usuarioRed={}, apliId={}",
                                usuarioRed,
                                apliId);

                String sql = Propiedades.getInstance()
                                .getPropiedad(Constantes.SQL_RECURSOS_OBTENER_USUARIO);

                List<RecursoUsuarioResponseDTO> recursos = new ArrayList<>();

                try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                                CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.registerOutParameter(1, OracleTypes.CURSOR);

                        stmt.setString(2, usuarioRed);

                        if (apliId != null) {
                                stmt.setLong(3, apliId);
                        } else {
                                stmt.setNull(3, Types.NUMERIC);
                        }

                        stmt.execute();

                        try (ResultSet rs = (ResultSet) stmt.getObject(1)) {

                                while (rs.next()) {

                                        RecursoUsuarioResponseDTO recurso = new RecursoUsuarioResponseDTO();

                                        recurso.setId(rs.getLong("ID"));
                                        recurso.setRecuIdPadre(rs.getLong("RECU_ID_PADRE"));
                                        recurso.setCodigo(rs.getString("CODIGO"));
                                        recurso.setNombre(rs.getString("NOMBRE"));
                                        recurso.setDescripcion(rs.getString("DESCRIPCION"));
                                        recurso.setTipo(rs.getString("TIPO"));
                                        recurso.setApliNombre(rs.getString("APLI_NOMBRE"));

                                        recursos.add(recurso);
                                }
                        }

                        logger.debug("obtenerRecursoUsuario - registros mapeados. total={}",
                                        recursos.size());

                } catch (Exception e) {

                        logger.error("obtenerRecursoUsuario - error. usuarioRed={}, apliId={}",
                                        usuarioRed,
                                        apliId, e);

                        throw new RuntimeException("Error consultando recursos del usuario", e);
                }

                return recursos;
        }

        // Crea un recurso -> PRC_CREAR_RECURSO
        public RecursoResponseDTO crearRecurso(
                        Long apliId,
                        CrearRecursoRequestDTO request) {

                logger.debug("crearRecurso - ejecutando PRC_CREAR_RECURSO. apliId={}, codigo={}",
                                apliId,
                                request.getCodigo());

                String sql = Propiedades.getInstance()
                                .getPropiedad(Constantes.SQL_RECURSOS_CREAR);

                try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                                CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.setLong(1, apliId);

                        if (request.getRecuIdPadre() != null) {
                                stmt.setLong(2, request.getRecuIdPadre());
                        } else {
                                stmt.setNull(2, Types.NUMERIC);
                        }

                        stmt.setString(3, request.getCodigo());
                        stmt.setString(4, request.getNombre());
                        stmt.setString(5, request.getDescripcion());
                        stmt.setString(6, request.getTipo());

                        stmt.registerOutParameter(7, OracleTypes.CURSOR);
                        stmt.registerOutParameter(8, OracleTypes.NUMBER);
                        stmt.registerOutParameter(9, OracleTypes.VARCHAR);

                        stmt.execute();

                        int codigoSalida = stmt.getInt(8);
                        String mensajeSalida = stmt.getString(9);

                        logger.debug("crearRecurso - PL respondió. codigo={}, mensaje={}",
                                        codigoSalida,
                                        mensajeSalida);

                        utilsBD.validarResultado(
                                        codigoSalida,
                                        mensajeSalida);

                        try (ResultSet rs = (ResultSet) stmt.getObject(7)) {

                                if (rs != null && rs.next()) {

                                        RecursoResponseDTO recurso = new RecursoResponseDTO();

                                        recurso.setId(rs.getLong("ID"));
                                        recurso.setApliId(rs.getLong("APLI_ID"));
                                        recurso.setRecuIdPadre(rs.getLong("RECU_ID_PADRE"));
                                        recurso.setCodigo(rs.getString("CODIGO"));
                                        recurso.setNombre(rs.getString("NOMBRE"));
                                        recurso.setDescripcion(rs.getString("DESCRIPCION"));
                                        recurso.setTipo(rs.getString("TIPO"));
                                        recurso.setEstado(rs.getString("ESTADO"));

                                        logger.debug("crearRecurso - registro mapeado. id={}, codigo={}",
                                                        recurso.getId(),
                                                        recurso.getCodigo());

                                        return recurso;
                                }
                        }

                        logger.warn("crearRecurso - el cursor vino vacío. apliId={}, codigo={}",
                                        apliId,
                                        request.getCodigo());

                        return null;

                } catch (Exception e) {

                        logger.error("crearRecurso - error ejecutando PL. apliId={}, codigo={}",
                                        apliId,
                                        request.getCodigo(), e);

                        throw new RuntimeException("Error creando recurso", e);
                }
        }

        // Modifica un recurso -> PRC_MODIFICAR_RECURSO
        public RecursoResponseDTO modificarRecurso(
                        Long apliId,
                        Long recuId,
                        ModificarRecursoRequestDTO request) {

                logger.debug("modificarRecurso - ejecutando PRC_MODIFICAR_RECURSO. id={}, apliId={}",
                                recuId,
                                apliId);

                String sql = Propiedades.getInstance()
                                .getPropiedad(Constantes.SQL_RECURSOS_MODIFICAR);

                try (Connection conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);
                                CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.setLong(1, recuId);
                        stmt.setLong(2, apliId);

                        if (request.getRecuIdPadre() != null) {
                                stmt.setLong(3, request.getRecuIdPadre());
                        } else {
                                stmt.setNull(3, Types.NUMERIC);
                        }

                        stmt.setString(4, request.getCodigo());
                        stmt.setString(5, request.getNombre());
                        stmt.setString(6, request.getDescripcion());
                        stmt.setString(7, request.getTipo());
                        stmt.setString(8, request.getEstado());

                        stmt.registerOutParameter(9, OracleTypes.CURSOR);
                        stmt.registerOutParameter(10, OracleTypes.NUMBER);
                        stmt.registerOutParameter(11, OracleTypes.VARCHAR);

                        stmt.execute();

                        int codigoSalida = stmt.getInt(10);
                        String mensajeSalida = stmt.getString(11);

                        logger.debug("modificarRecurso - PL respondió. codigo={}, mensaje={}",
                                        codigoSalida,
                                        mensajeSalida);

                        utilsBD.validarResultado(
                                        codigoSalida,
                                        mensajeSalida);

                        try (ResultSet rs = (ResultSet) stmt.getObject(9)) {

                                if (rs != null && rs.next()) {

                                        RecursoResponseDTO recurso = new RecursoResponseDTO();

                                        recurso.setId(rs.getLong("ID"));
                                        recurso.setApliId(rs.getLong("APLI_ID"));
                                        recurso.setRecuIdPadre(rs.getLong("RECU_ID_PADRE"));
                                        recurso.setCodigo(rs.getString("CODIGO"));
                                        recurso.setNombre(rs.getString("NOMBRE"));
                                        recurso.setDescripcion(rs.getString("DESCRIPCION"));
                                        recurso.setTipo(rs.getString("TIPO"));
                                        recurso.setEstado(rs.getString("ESTADO"));

                                        logger.debug("modificarRecurso - registro mapeado. id={}, codigo={}",
                                                        recurso.getId(),
                                                        recurso.getCodigo());

                                        return recurso;
                                }
                        }

                        logger.warn("modificarRecurso - el cursor vino vacío. id={}, apliId={}",
                                        recuId,
                                        apliId);

                        return null;

                } catch (Exception e) {

                        logger.error("modificarRecurso - error ejecutando PL. id={}, apliId={}",
                                        recuId,
                                        apliId, e);

                        throw new RuntimeException("Error modificando recurso", e);
                }
        }
}