package com.giu.repository;

import java.sql.CallableStatement;
import java.sql.Connection;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Repository;

import com.giu.model.gestionSeguridad.GestionarEstadoUsuarioRequest;
import com.giu.utils.Constantes;
import com.giu.utils.utilsBD;

import oracle.jdbc.OracleTypes;

@Repository
public class GestionSeguridadRepository {

        private static final Logger logger = LogManager.getLogger(Constantes.APLICACION);

        public void gestionarEstadoUsuario(
                        GestionarEstadoUsuarioRequest request) {

                try (Connection conn = utilsBD.obtenerConexion(
                                Constantes.NOMBRE_BD_GIU)) {

                        String sql = "{ call PKG_GIU_GESTION_SEGURIDAD.PRC_GESTIONAR_ESTADO_USUARIO("
                                        + "?, ?, ?, ?, ?) }";

                        try (CallableStatement stmt = conn.prepareCall(sql)) {

                                stmt.setLong(1,request.getApliId());

                                stmt.setString(2,request.getUsuarioRed());

                                stmt.setInt(3,request.getOperacion());

                                stmt.registerOutParameter(4,OracleTypes.NUMBER);

                                stmt.registerOutParameter(5,OracleTypes.VARCHAR);

                                stmt.execute();

                                int codigoSalida = stmt.getInt(4);

                                String mensajeSalida = stmt.getString(5);

                                utilsBD.validarResultado(
                                                codigoSalida,
                                                mensajeSalida);
                        }

                } catch (Exception e) {

                        logger.error(
                                        "Error gestionando estado del usuario: {}",
                                        request.getUsuarioRed(),
                                        request.getOperacion(),
                                        e);

                        throw new RuntimeException(e);
                }
        }



        
}