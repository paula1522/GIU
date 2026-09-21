package com.giu.utils;

import java.sql.Connection;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class TransaccionUtils {

    private static final Logger logger =
            LogManager.getLogger(TransaccionUtils.class);

    private static final ThreadLocal<Connection> CONEXION_ACTUAL =
            new ThreadLocal<>();

    @FunctionalInterface
    public interface OperacionTransaccion<T> {
        T ejecutar(Connection conn) throws Exception;
    }

    public static <T> T ejecutar(OperacionTransaccion<T> operacion) {

        Connection conexionActual = CONEXION_ACTUAL.get();



        if (conexionActual != null) {
            try {
                return operacion.ejecutar(conexionActual);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        Connection conn = null;

        try {
            conn = utilsBD.obtenerConexion(Constantes.NOMBRE_BD_GIU);

            conn.setAutoCommit(false);

            CONEXION_ACTUAL.set(conn);

            T resultado = operacion.ejecutar(conn);

            conn.commit();

            logger.info("Transacción confirmada correctamente.");

            return resultado;

        } catch (Exception e) {

            logger.error(
                    "Error en la transacción. Se realizará ROLLBACK.",
                    e);

            if (conn != null) {
                try {
                    conn.rollback();

                    logger.info(
                            "ROLLBACK realizado correctamente.");

                } catch (Exception rollbackException) {

                    logger.error(
                            "Error realizando ROLLBACK.",
                            rollbackException);
                }
            }

            throw new RuntimeException(e);

        } finally {

            CONEXION_ACTUAL.remove();

            if (conn != null) {
                try {
                    conn.close();

                    logger.debug(
                            "Conexión cerrada correctamente.");

                } catch (Exception closeException) {

                    logger.error(
                            "Error cerrando conexión.",
                            closeException);
                }
            }
        }
    }
}