
package com.GIU.BACKEND.utils;

import java.sql.Connection;
import java.sql.DriverManager;

import javax.naming.InitialContext;
import javax.sql.DataSource;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class utilsBD {

    private static final Logger logger =
            LogManager.getLogger(Constantes.APLICACION);

    private utilsBD() {
    }

    public static Connection obtenerConexion(
            String jndiName,
            String url,
            String user,
            String password,
            String driver) {

        System.out.println(">>> INICIO obtenerConexionBD");
        System.out.println(">>> JNDI: " + jndiName);

        // Intento 1: Conexion mediante JNDI
        if (jndiName != null && !jndiName.trim().isEmpty()) {
            try {
                System.out.println(">>> Intentando lookup JNDI");

                InitialContext ctx = new InitialContext();
                DataSource ds = (DataSource) ctx.lookup(jndiName.trim());
                System.out.println(">>> JNDI lookup OK");
                Connection conn = ds.getConnection();
                System.out.println(">>> getConnection OK");
                logger.info(
                        "Conexion BD establecida correctamente via JNDI: {}",
                        jndiName);

                return conn;

            } catch (Exception e) {
                System.out.println(">>> ERROR JNDI: " + e.getMessage());

                logger.warn(
                        "No se pudo conectar via JNDI ({}). Intentando conexion JDBC directa...",
                        jndiName,
                        e);
            }
        }

        // Intento 2: Conexion JDBC directa
        if (url != null && user != null && password != null) {
            try {

                if (driver != null && !driver.trim().isEmpty()) {
                    Class.forName(driver.trim());
                }

                Connection conn = DriverManager.getConnection(
                        url.trim(),
                        user.trim(),
                        password.trim());

                logger.info(
                        "Conexion BD establecida correctamente via JDBC Local ({})",
                        url);

                return conn;

            } catch (Exception e) {

                logger.error(
                        "Error al establecer conexion JDBC Local",
                        e);
            }
        }

        return null;
    }
}
