package com.giu.utils;

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

    public static Connection obtenerConexion(String nombreBD) {

        System.out.println(">>> INICIO obtenerConexion");
        System.out.println(">>> Base de Datos: " + nombreBD);

        String prefijo =
                Constantes.PREFIJO_PROPIEDADES_BD + nombreBD;

        /*
         * ==========================================================
         * 1. OBTENER PROPIEDADES DE LA BASE DE DATOS
         * ==========================================================
         */

        String url = Propiedades.getInstance()
                .getPropiedad(prefijo + ".url");

        String user = Propiedades.getInstance()
                .getPropiedad(prefijo + ".user");

        String password = Propiedades.getInstance()
                .getPropiedad(prefijo + ".password");

        String driver = Propiedades.getInstance()
                .getPropiedad(prefijo + ".driver");

        /*
         * ==========================================================
         * 2. OBTENER NOMBRE JNDI
         * ==========================================================
         *
         * La propiedad debe contener SOLAMENTE el nombre configurado
         * en WebLogic.
         *
         * Ejemplo:
         *
         * system.db.giu.jndi=jdbc/GIUDatalolo
         *
         */

        String jndiName = Propiedades.getInstance()
                .getPropiedad(prefijo + ".jndi");

        System.out.println(">>> Propiedad JNDI: " + jndiName);

        /*
         * ==========================================================
         * 3. INTENTO DE CONEXIÓN MEDIANTE JNDI
         * ==========================================================
         */

        if (jndiName != null && !jndiName.trim().isEmpty()) {

            try {

                jndiName = jndiName.trim();

                System.out.println(
                        ">>> Intentando conexión mediante JNDI: "
                                + jndiName);

                InitialContext ctx = new InitialContext();

                DataSource dataSource =
                        (DataSource) ctx.lookup(jndiName);

                System.out.println(
                        ">>> JNDI encontrado correctamente");

                Connection connection =
                        dataSource.getConnection();

                System.out.println(
                        ">>> Conexión obtenida mediante JNDI");

                logger.info(
                        "Conexión BD establecida correctamente vía JNDI: {}",
                        jndiName);

                return connection;

            } catch (Exception e) {

                System.out.println(
                        ">>> ERROR conexión JNDI: "
                                + e.getMessage());

                logger.warn(
                        "No fue posible establecer conexión mediante JNDI: {}",
                        jndiName,
                        e);

                /*
                 * IMPORTANTE:
                 *
                 * No lanzamos la excepción aquí.
                 *
                 * Si JNDI falla, continuamos con JDBC directo.
                 */
            }
        }

        /*
         * ==========================================================
         * 4. INTENTO DE CONEXIÓN JDBC DIRECTA
         * ==========================================================
         */

        System.out.println(
                ">>> Intentando conexión JDBC directa");

        if (url != null
                && user != null
                && password != null) {

            try {

                if (driver != null
                        && !driver.trim().isEmpty()) {

                    Class.forName(driver.trim());
                }

                Connection connection =
                        DriverManager.getConnection(
                                url.trim(),
                                user.trim(),
                                password.trim());

                System.out.println(
                        ">>> Conexión JDBC directa OK");

                logger.info(
                        "Conexión BD establecida correctamente vía JDBC Local ({})",
                        url);

                return connection;

            } catch (Exception e) {

                System.out.println(
                        ">>> ERROR conexión JDBC: "
                                + e.getMessage());

                logger.error(
                        "Error al establecer conexión JDBC Local",
                        e);

                throw new RuntimeException(
                        "No fue posible establecer conexión con la Base de Datos.",
                        e);
            }
        }

        /*
         * ==========================================================
         * 5. NINGÚN MÉTODO DE CONEXIÓN DISPONIBLE
         * ==========================================================
         */

        throw new RuntimeException(
                "No fue posible establecer conexión con la Base de Datos.");
    }
}

