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
            String tipoConexion,
            String nombreBD) {

        System.out.println(">>> INICIO obtenerConexionBD");
        System.out.println(">>> Tipo conexion: " + tipoConexion);
        System.out.println(">>> Base de Datos: " + nombreBD);

        String prefijo =
                Constantes.PREFIJO_PROPIEDADES_BD + nombreBD;

        String url = Propiedades.getInstance()
                .getPropiedad(prefijo + ".url");

        String user = Propiedades.getInstance()
                .getPropiedad(prefijo + ".user");

        String password = Propiedades.getInstance()
                .getPropiedad(prefijo + ".password");

        String driver = Propiedades.getInstance()
                .getPropiedad(prefijo + ".driver");

        // JNDI fijo
        String jndiName = Propiedades.getInstance()
        .getPropiedad(
                Constantes.NOMBRE_JNDI_PARA_CARGUE_DE_PROPIEDADES);

        System.out.println(">>> JNDI: " + jndiName);

        // Intento 1: Conexion mediante JNDI
        if (Constantes.TIPO_CONEXION_JNDI.equalsIgnoreCase(tipoConexion)
                && jndiName != null
                && !jndiName.trim().isEmpty()) {

            try {

                System.out.println(">>> Intentando lookup JNDI");

                InitialContext ctx = new InitialContext();

                DataSource ds =
                        (DataSource) ctx.lookup(jndiName.trim());

                System.out.println(">>> JNDI lookup OK");

                Connection conn = ds.getConnection();

                System.out.println(">>> getConnection OK");

                logger.info(
                        "Conexion BD establecida correctamente via JNDI: {}",
                        jndiName);

                return conn;

            } catch (Exception e) {

                System.out.println(
                        ">>> ERROR JNDI: " + e.getMessage());

                logger.warn(
                        "Error al establecer conexion mediante JNDI: {}",
                        jndiName,
                        e);
            }
        }

        // Intento 2: Conexion JDBC directa
        if (Constantes.TIPO_CONEXION_JDBC.equalsIgnoreCase(tipoConexion)
                && url != null
                && user != null
                && password != null) {

            try {

                if (driver != null && !driver.trim().isEmpty()) {
                    Class.forName(driver.trim());
                }

                Connection conn =
                        DriverManager.getConnection(
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

                throw new RuntimeException(
                        "No fue posible establecer conexion con la Base de Datos.",
                        e);
            }
        }

        throw new RuntimeException(
                "No fue posible establecer conexion con la Base de Datos.");
    }
}