package com.GIU.BACKEND.utils;

import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.naming.InitialContext;
import javax.sql.DataSource;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Propiedades {

    private static final Logger logger = LogManager.getLogger(Constantes.APLICACION);
    private static final Properties properties = new Properties();
    private static Propiedades instance;

    private Propiedades() {
    }

    private void cargarPropiedadesHibrida() {

        logger.info("========== INICIO CARGA DE PROPIEDADES ==========");

        try {

            logger.info("Cargando propiedades desde archivo: {}",
                    Configurador.getRUTA_PROPIEDADES());

            cargarPropiedadesPorArchivo();

            logger.info("Propiedades desde archivo cargadas. Total: {}",
                    properties.size());

            logger.info("Iniciando carga de propiedades desde Base de Datos");

            boolean cargaExitosaBD = cargarPropiedadesPorBD();

            if (cargaExitosaBD) {
                logger.info(
                        "Propiedades sobreescritas/actualizadas exitosamente desde Base de Datos");
            } else {
                logger.warn(
                        "No se pudieron cargar propiedades desde BD. Se conservan las del archivo.");
            }

        } catch (Exception e) {

            logger.error(
                    "Error durante la carga híbrida de propiedades",
                    e);

        } finally {

            logger.info(
                    "Carga de propiedades finalizada. Total de propiedades: {}",
                    properties.size());

            escribirPropiedades();

            logger.info("========== FIN CARGA DE PROPIEDADES ==========");
        }
    }

    private void cargarPropiedadesPorArchivo() {
        try (InputStream entrada = new FileInputStream(Configurador.getRUTA_PROPIEDADES())) {
            properties.clear();
            properties.load(entrada);
            logger.info("Propiedades cargadas desde archivo: {}", Configurador.getRUTA_PROPIEDADES());
        } catch (Exception e) {
            logger.error("Error obteniendo parametros de configuracion por medio de archivo", e);
        }
    }

    private boolean cargarPropiedadesPorBD() {

        System.out.println("[" + Constantes.APLICACION + "] >>> INICIO cargarPropiedadesPorBD");

        Connection conn = null;
        Statement stmt = null;

        try {

            System.out.println("[" + Constantes.APLICACION + "] >>> Solicitando conexion a BD");

            conn = obtenerConexionBD();

            System.out.println("[" + Constantes.APLICACION + "] >>> Resultado conexion BD: "
                    + (conn != null ? "OK" : "NULL"));

            if (conn == null) {
                logger.warn("No fue posible establecer conexion con la Base de Datos para leer propiedades.");
                System.out.println("[" + Constantes.APLICACION + "] >>> conexion BD NULL");
                return false;
            }

            String query = properties.getProperty(Constantes.CONSULTA_DE_PROPIEDADES);

            System.out.println("[" + Constantes.APLICACION + "] >>> Ejecutando consulta de propiedades");

            try (PreparedStatement pstmt = conn.prepareStatement(query)) {

                pstmt.setString(1, Constantes.NOMBRE_APLICACION_BASE_DATOS);

                try (ResultSet rs = pstmt.executeQuery()) {

                    int contador = 0;

                    while (rs.next()) {
                        String clave = rs.getString("CLAVE");
                        String valor = rs.getString("VALOR");

                        if (clave != null && valor != null) {
                            properties.setProperty(clave.trim(), valor.trim());
                            contador++;
                        }
                    }

                    System.out.println("[" + Constantes.APLICACION
                            + "] >>> Propiedades BD cargadas: " + contador);
                }
            }

            logger.info("Se cargaron propiedades desde la Base de Datos");
            return true;

        } catch (Exception e) {

            System.out.println("[" + Constantes.APLICACION
                    + "] >>> ERROR consultando BD: " + e.getMessage());

            logger.error("Error consultando la tabla de propiedades en Base de Datos", e);
            return false;

        } finally {
            cerrarRecursosBD(null, stmt, conn);

            System.out.println("[" + Constantes.APLICACION
                    + "] >>> FIN cargarPropiedadesPorBD");
        }
    }

    private Connection obtenerConexionBD() {
    	System.out.println(">>> INICIO obtenerConexionBD");
    	
        String jndiName = getPropiedad(Constantes.NOMBRE_JNDI_PARA_CARGUE_DE_PROPIEDADES);
        System.out.println(">>> JNDI: " + jndiName);

        // Intento 1: Servidor WebLogic vía DataSource / JNDI (Producción / QA)
        if (jndiName != null && !jndiName.trim().isEmpty()) {
            try {
            	System.out.println(">>> Intentando lookup JNDI");
                InitialContext ctx = new InitialContext();
                DataSource ds = (DataSource) ctx.lookup(jndiName.trim());
                System.out.println(">>> JNDI lookup OK");
                Connection conn = ds.getConnection();
                System.out.println(">>> getConnection OK");
                logger.info("Conexion BD establecida correctamente via JNDI: {}", jndiName);
                return conn;
            } catch (Exception e) {
            	System.out.println(">>> ERROR JNDI: " + e.getMessage());
            	 logger.warn(
            	            "No se pudo conectar via JNDI ({}). Intentando conexion JDBC directa...",
            	            jndiName,
            	            e
            	    );
            }
        }

        // Intento 2: JDBC Directo para desarrollo Local (Sin WebLogic)
        String url = getPropiedad(Constantes.JDBC_CARGUE_DE_PROPS_URL);
        String user = getPropiedad(Constantes.JDBC_CARGUE_DE_PROPS_USER);
        String pass = getPropiedad(Constantes.JDBC_CARGUE_DE_PROPS_PASSWORD);
        String driver = getPropiedad(Constantes.JDBC_CARGUE_DE_PROPS_DRIVER);

        if (url != null && user != null && pass != null) {
            try {
                if (driver != null && !driver.isEmpty()) {
                    Class.forName(driver.trim());
                }
                Connection conn = DriverManager.getConnection(url.trim(), user.trim(), pass.trim());
                logger.info("Conexion BD establecida correctamente via JDBC Local ({})", url);
                return conn;
            } catch (Exception e) {
                logger.error("Error al establecer conexion JDBC Local para propiedades", e);
            }
        }

        return null;
    }

    private void cerrarRecursosBD(ResultSet rs, Statement stmt, Connection conn) {
        try { if (rs != null) rs.close(); } catch (Exception ignored) {}
        try { if (stmt != null) stmt.close(); } catch (Exception ignored) {}
        try { if (conn != null) conn.close(); } catch (Exception ignored) {}
    }

    public static Propiedades getInstance() {
        synchronized (Propiedades.class) {
            if (instance == null) {
                instance = new Propiedades();
                instance.cargarPropiedadesHibrida();
            }
        }
        return instance;
    }

    public String getPropiedad(String propiedad, Object... params) {
        String message = properties.getProperty(propiedad);
        if (message != null && params != null && params.length != 0) {
            message = MessageFormat.format(message, params);
        }
        return message;
    }
    public Map<String, String> getTodasLasPropiedades() {
        Map<String, String> mapaProps = new HashMap();
        for (String name : properties.stringPropertyNames()) {
            mapaProps.put(name, properties.getProperty(name));
        }
        return mapaProps;
    }

    public Integer getIntPropiedad(String propiedad) {
        try {
            String message = properties.getProperty(propiedad);
            return Integer.parseInt(message);
        } catch (Exception e) {
            logger.info("Error al obtener la propiedad {}", propiedad);
            return null;
        }
    }

    protected static void resetProperties() {
        logger.info("Llamado a proceso de actualizacion de propiedades");
        instance = null;
        getInstance();
        escribirPropiedades();
        logger.info("Actualizacion realizada con exito");
    }

    protected static void escribirPropiedades() {
        StringBuilder propiedadesCargadas = new StringBuilder();

        properties.stringPropertyNames().stream()
                .sorted()
                .forEach(key -> propiedadesCargadas.append(key)
                        .append('=')
                        .append(properties.getProperty(key))
                        .append(System.lineSeparator()));
        logger.info("========== PROPIEDADES FINALES CARGADAS ==========");
        logger.info("Las propiedades cargadas en el sistema son:{}{}",
                System.lineSeparator(),
                propiedadesCargadas.toString());
        logger.info("========== FIN PROPIEDADES FINALES ==========");
    }
}