package com.giu.utils;

import java.sql.Connection;
import java.sql.DriverManager;

import javax.naming.InitialContext;
import javax.sql.DataSource;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class utilsBD {

        // Se define un logger para registrar eventos y errores en la aplicación
        private static final Logger logger = LogManager.getLogger(Constantes.APLICACION);

        // Método para obtener una conexión a la base de datos utilizando JNDI o JDBC 
        public static Connection obtenerConexion(String nombreBD) {

                System.out.println(">>> INICIO obtenerConexion");
                System.out.println(">>> Base de Datos: " + nombreBD);

                String prefijo = Constantes.PREFIJO_PROPIEDADES_BD + nombreBD;

                //Obtener propiedades de conexión 
                String url = Propiedades.getInstance()
                                .getPropiedad(prefijo + ".url");

                String user = Propiedades.getInstance()
                                .getPropiedad(prefijo + ".user");

                String password = Propiedades.getInstance()
                                .getPropiedad(prefijo + ".password");

                String driver = Propiedades.getInstance()
                                .getPropiedad(prefijo + ".driver");

                //Obtener nombre JNDI
                String jndiName = Propiedades.getInstance()
                                .getPropiedad(prefijo + ".jndi");

                System.out.println(">>> Propiedad JNDI: " + jndiName);

                //1. Intento de conexión mediante JNDI

                if (jndiName != null && !jndiName.trim().isEmpty()) {

                        try {

                                jndiName = jndiName.trim();

                                System.out.println(
                                                ">>> Intentando conexión mediante JNDI: "
                                                                + jndiName);

                                InitialContext ctx = new InitialContext();

                                DataSource dataSource = (DataSource) ctx.lookup(jndiName);

                                System.out.println(
                                                ">>> JNDI encontrado correctamente");

                                Connection connection = dataSource.getConnection();

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

                        }
                }

                //2. Intento de conexión mediante JDBC directa

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

                                Connection connection = DriverManager.getConnection(
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

                throw new RuntimeException(
                                "No fue posible establecer conexión con la Base de Datos.");
        }


        // Método para validar el resultado de una operación en la base de datos
        public static void validarResultado(int codigoSalida, String mensajeSalida) {
                if (codigoSalida != 0) {
                        throw new RuntimeException(mensajeSalida);
                }
        }
}
