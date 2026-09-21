package com.giu.repository;

import java.sql.CallableStatement;
import java.sql.Connection;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Repository;

import com.giu.model.gestionSeguridad.GestionarEstadoUsuarioRequest;
import com.giu.utils.Constantes;
import com.giu.utils.Propiedades;
import com.giu.utils.utilsBD;

import oracle.jdbc.OracleTypes;

@Repository
public class GestionSeguridadRepository {

        private static final Logger logger = LogManager.getLogger(GestionSeguridadRepository.class);

        public void gestionarEstadoUsuario(
                        Connection conn,
                        GestionarEstadoUsuarioRequest request) {

                logger.debug("gestionarEstadoUsuario - ejecutando PRC_GESTIONAR_ESTADO_USUARIO. usuarioRed={}, apliId={}, operacion={}",
                                request.getUsuarioRed(),
                                request.getApliId(),
                                request.getOperacion());

                String sql = Propiedades.getInstance().getPropiedad(Constantes.SQL_SEGURIDAD_GESTIONAR_ESTADO);

                try (CallableStatement stmt = conn.prepareCall(sql)) {

                        stmt.setLong(1, request.getApliId());
                        stmt.setString(2, request.getUsuarioRed());
                        stmt.setInt(3, request.getOperacion());

                        stmt.registerOutParameter(4, OracleTypes.NUMBER);
                        stmt.registerOutParameter(5, OracleTypes.VARCHAR);

                        stmt.execute();

                        int codigoSalida = stmt.getInt(4);
                        String mensajeSalida = stmt.getString(5);

                        logger.debug("gestionarEstadoUsuario - PL respondió. codigo={}, mensaje={}",
                                        codigoSalida,
                                        mensajeSalida);

                        utilsBD.validarResultado(codigoSalida, mensajeSalida);

                } catch (Exception e) {

                        logger.error("gestionarEstadoUsuario - error ejecutando PL. usuarioRed={}, apliId={}, operacion={}",
                                        request.getUsuarioRed(),
                                        request.getApliId(),
                                        request.getOperacion(), e);

                        throw new RuntimeException(e);
                }
        }
}