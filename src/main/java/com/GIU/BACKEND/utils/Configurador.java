package com.GIU.BACKEND.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URI;
import java.util.Properties;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.ThreadContext;
import org.apache.logging.log4j.core.LoggerContext;

public class Configurador {

    private static String RUTA_PROPIEDADES;
    private static String NOMBRE_LOGGER;
    private static String NOMBRE_APLICACION;

    /**
     * Configuración inicial de la aplicación.
     *
     * <p>
     * El proceso se realiza en dos etapas:
     *
     * <ol>
     *     <li>Se configura Log4j2 con la ruta inicial definida por Spring.</li>
     *     <li>Se cargan las propiedades desde archivo y Base de Datos.</li>
     *     <li>Se obtiene la ruta definitiva de Log4j2.</li>
     *     <li>Si la ruta cambió, se reconfigura Log4j2.</li>
     * </ol>
     *
     * @param rutaPropiedades ruta base del archivo de propiedades
     * @param nombreLogger nombre del logger
     * @param nombreAplicacion nombre de la aplicación
     */
    public static void configurar(
            String rutaPropiedades,
            String nombreLogger,
            String nombreAplicacion) {

        RUTA_PROPIEDADES = resolveRutaPropiedades(rutaPropiedades);
        NOMBRE_LOGGER = nombreLogger;
        NOMBRE_APLICACION = nombreAplicacion;
        
        /*
         * Configuración inicial de Log4j2.
         *
         * Se realiza antes de cargar Propiedades para garantizar
         * que todos los logs de archivo + BD queden registrados.
         */
        configurarLogInicial();

        Logger logger = obtenerLogger();

        logger.info(
                "==================================================");
        logger.info(
                "INICIO DE INICIALIZACION DE CONFIGURACION");
        logger.info(
                "Archivo de propiedades resuelto: {}",
                RUTA_PROPIEDADES);
        logger.info(
                "==================================================");

        /*
         * Carga archivo + BD.
         *
         * Todos los logs generados durante este proceso
         * deberían escribirse en la configuración inicial.
         */
        Propiedades.getInstance();

        /*
         * Una vez cargadas todas las propiedades se determina
         * si Log4j2 debe cambiar de configuración.
         */
        configurarLogFinal();

        logger = obtenerLogger();

        logger.info(
                "Inicializacion de configuracion finalizada correctamente");
    }

    /**
     * Configura Log4j2 inicialmente utilizando la propiedad
     * logging.config definida por Spring Boot.
     *
     * <p>
     * Como respaldo, si no existe logging.config, se intenta
     * obtener LOG_CONFIG_FILE directamente del archivo de
     * propiedades resuelto.
     * </p>
     */
    private static void configurarLogInicial() {

        try {

            if (RUTA_PROPIEDADES == null
                    || RUTA_PROPIEDADES.trim().isEmpty()) {

                System.out.println(
                        "[" + Constantes.APLICACION
                                + "] No existe ruta de propiedades para configurar Log4j2 inicialmente.");

                return;
            }

            Properties propTemporal =
                    new Properties();

            try (InputStream input =
                         new FileInputStream(RUTA_PROPIEDADES)) {

                propTemporal.load(input);
            }

            String logConfigPath =
                    propTemporal.getProperty(
                            Constantes.LOG_CONFIG_FILE);

            if (logConfigPath == null
                    || logConfigPath.trim().isEmpty()) {

                System.out.println(
                        "[" + Constantes.APLICACION
                                + "] No se encontró "
                                + Constantes.LOG_CONFIG_FILE
                                + " en el archivo de propiedades inicial.");

                return;
            }

            File file =
                    resolverArchivo(logConfigPath);

            if (file == null
                    || !file.exists()
                    || !file.isFile()) {

                System.out.println(
                        "[" + Constantes.APLICACION
                                + "] No existe archivo de configuración Log4j2 inicial: "
                                + logConfigPath);

                return;
            }

            LoggerContext context =
                    (LoggerContext) LogManager.getContext(false);

            context.setConfigLocation(
                    file.toURI());

            context.reconfigure();

            Logger logger =
                    LogManager.getLogger(
                            NOMBRE_LOGGER != null
                                    ? NOMBRE_LOGGER
                                    : Constantes.APLICACION);

            logger.info(
                    "Configuración inicial de Log4j2 aplicada desde: {}",
                    file.getAbsolutePath());

        } catch (Exception e) {

            System.out.println(
                    "[" + Constantes.APLICACION
                            + "] Error configurando Log4j2 inicial: "
                            + e.getMessage());
        }
    }

    /**
     * Obtiene LOG_CONFIG_FILE directamente del archivo físico
     * de propiedades.
     */
    private static String obtenerRutaLogDesdeArchivo() {

        try {

            java.util.Properties properties =
                    new java.util.Properties();

            try (java.io.InputStream input =
                         new java.io.FileInputStream(
                                 RUTA_PROPIEDADES)) {

                properties.load(input);

                return properties.getProperty(
                        Constantes.LOG_CONFIG_FILE);
            }

        } catch (Exception e) {

            return null;
        }
    }

    /**
     * Reconfigura Log4j2 después de haber cargado las propiedades.
     *
     * <p>
     * Si la ruta final es igual a la ruta actual, no se realiza
     * ninguna reconfiguración.
     * </p>
     */
    private static void configurarLogFinal() {

        Propiedades prop =
                Propiedades.getInstance();

        String logConfigPath =
                prop.getPropiedad(
                        Constantes.LOG_CONFIG_FILE);

        if (logConfigPath == null
                || logConfigPath.trim().isEmpty()) {

            obtenerLogger().warn(
                    "No se encontró la propiedad {}. "
                            + "Se mantiene la configuración actual de Log4j2.",
                    Constantes.LOG_CONFIG_FILE);

            return;
        }

        File nuevaConfiguracion =
                resolverArchivo(logConfigPath);

        if (nuevaConfiguracion == null
                || !nuevaConfiguracion.exists()
                || !nuevaConfiguracion.isFile()) {

            obtenerLogger().warn(
                    "No existe el archivo de configuración Log4j2 definido "
                            + "en las propiedades: {}. "
                            + "Se mantiene la configuración actual.",
                    logConfigPath);

            return;
        }

        LoggerContext context =
                (LoggerContext) LogManager.getContext(false);

        URI configuracionActual =
                context.getConfigLocation();

        String rutaActual =
                normalizarRuta(configuracionActual);

        String rutaNueva =
                nuevaConfiguracion.getAbsolutePath();

        obtenerLogger().info(
                "Configuración Log4j2 actual: {}",
                rutaActual);

        obtenerLogger().info(
                "Configuración Log4j2 definida por propiedades: {}",
                rutaNueva);

        /*
         * Si no se pudo determinar la ruta actual, se considera
         * necesario aplicar la configuración definitiva.
         */
        if (rutaActual == null) {

            obtenerLogger().info(
                    "No se pudo determinar la configuración actual "
                            + "de Log4j2. Se aplicará la configuración definitiva.");

            aplicarConfiguracionLog(
                    context,
                    nuevaConfiguracion);

            return;
        }

        /*
         * Si las rutas son iguales no se realiza ningún cambio.
         */
        if (compararRutas(
                rutaActual,
                rutaNueva)) {

            obtenerLogger().info(
                    "La configuración Log4j2 no cambió. "
                            + "Se mantiene la ruta actual: {}",
                    rutaNueva);

            return;
        }

        /*
         * La configuración cambió.
         */
        obtenerLogger().info(
                "La configuración Log4j2 cambió. "
                        + "Aplicando nueva configuración: {}",
                rutaNueva);

        aplicarConfiguracionLog(
                context,
                nuevaConfiguracion);
    }

    /**
     * Aplica una configuración Log4j2.
     */
    private static void aplicarConfiguracionLog(
            LoggerContext context,
            File configuracion) {

        try {

            context.setConfigLocation(
                    configuracion.toURI());

            context.reconfigure();

            obtenerLogger().info(
                    "Configuración Log4j2 actualizada correctamente. "
                            + "Nueva configuración: {}",
                    configuracion.getAbsolutePath());

        } catch (Exception e) {

            obtenerLogger().error(
                    "Error aplicando configuración Log4j2: {}",
                    configuracion.getAbsolutePath(),
                    e);
        }
    }

    /**
     * Resuelve una ruta de configuración Log4j2.
     */
    private static File resolverArchivo(String ruta) {

        if (ruta == null
                || ruta.trim().isEmpty()) {

            return null;
        }

        String normalizedPath =
                ruta.trim().replace("\\", "/");

        /*
         * Soporte para:
         *
         * file:/applications/...
         */
        if (normalizedPath.startsWith("file:")) {

            normalizedPath =
                    normalizedPath.substring(
                            "file:".length());
        }

        File file =
                new File(normalizedPath);

        /*
         * Compatibilidad Windows.
         */
        if (!file.exists()
                && System.getProperty("os.name")
                        .toLowerCase()
                        .contains("win")
                && normalizedPath.startsWith("/")) {

            file =
                    new File(
                            "C:" + normalizedPath);
        }

        return file;
    }

    /**
     * Obtiene la ruta absoluta asociada a la configuración actual.
     */
    private static String normalizarRuta(URI uri) {

        if (uri == null) {
            return null;
        }

        try {

            if ("file".equalsIgnoreCase(
                    uri.getScheme())) {

                return new File(uri)
                        .getAbsolutePath();
            }

            return new File(uri.getPath())
                    .getAbsolutePath();

        } catch (Exception e) {

            return uri.getPath();
        }
    }

    /**
     * Compara dos rutas de archivo.
     */
    private static boolean compararRutas(
            String rutaActual,
            String rutaNueva) {

        if (rutaActual == null
                || rutaNueva == null) {

            return false;
        }

        try {

            File archivoActual =
                    new File(rutaActual)
                            .getCanonicalFile();

            File archivoNuevo =
                    new File(rutaNueva)
                            .getCanonicalFile();

            return archivoActual.equals(
                    archivoNuevo);

        } catch (Exception e) {

            return rutaActual.trim()
                    .equalsIgnoreCase(
                            rutaNueva.trim());
        }
    }

    /**
     * Obtiene el logger principal de la aplicación.
     */
    private static Logger obtenerLogger() {

        return LogManager.getLogger(
                NOMBRE_LOGGER != null
                        ? NOMBRE_LOGGER
                        : Constantes.APLICACION);
    }

    public static String resetPropiedades(
            String rutaPropiedades,
            String nombreLogger,
            String nombreAplicacion) {

        Logger logger =
                LogManager.getLogger(
                        getNOMBRE_LOGGER() != null
                                ? getNOMBRE_LOGGER()
                                : nombreLogger);

        ParametrosIniciales param =
                iniciarTransaccion();

        String response;

        try {

            RUTA_PROPIEDADES =
                    resolveRutaPropiedades(
                            rutaPropiedades);

            NOMBRE_LOGGER =
                    nombreLogger;

            NOMBRE_APLICACION =
                    nombreAplicacion;

            logger.info(
                    "Iniciando reinicio de propiedades. "
                            + "Archivo: {}",
                    RUTA_PROPIEDADES);

            /*
             * Recarga archivo + BD utilizando la configuración
             * Log4j2 actualmente activa.
             */
            Propiedades.resetProperties();

            /*
             * Después de la recarga se verifica si cambió
             * la configuración de Log4j2.
             */
            configurarLogFinal();

            logger =
                    obtenerLogger();

            logger.info(
                    "Propiedades reiniciadas correctamente");

            response =
                    "Propiedades reiniciadas correctamente";

        } catch (Throwable tr) {

            logger.error(
                    "Error actualizando las propiedades del sistema",
                    tr);

            response =
                    "Error actualizando las propiedades del sistema";

        } finally {

            cerrarTransaccion(
                    param,
                    logger);
        }

        return response;
    }

    public static ParametrosIniciales iniciarTransaccion() {

        ParametrosIniciales param =
                new ParametrosIniciales();

        ThreadContext.put(
                "UUID",
                "LIGA-" + Long.toString(
                        param.getUuid()));

        return param;
    }

    public static ParametrosIniciales iniciarTransaccion(
            Long UUID) {

        ParametrosIniciales param =
                new ParametrosIniciales();

        ThreadContext.put(
                "UUID",
                "FE-" + Long.toString(UUID));

        return param;
    }

    private static String resolveRutaPropiedades(
            String rutaPropiedades) {
    	System.out.println("RUTA DE PROPIEDADES PARA RESOLVER EL PERFIL DE PROP "+ rutaPropiedades);


        String perfil =
                resolvePerfil(
                        rutaPropiedades);

        if (perfil != null) {

            String perfilPath =
                    resolveProfilePath(
                            rutaPropiedades,
                            perfil);

            if (exists(perfilPath)) {

                return new File(
                        perfilPath)
                        .getAbsolutePath();
            }
        }

        if (exists(rutaPropiedades)) {

            return new File(
                    rutaPropiedades)
                    .getAbsolutePath();
        }

        File localFile =
                new File(
                        Constantes.RUTA_ARCHIVO_PROPIEDADES);

        if (perfil != null) {

            String localPerfilPath =
                    resolveProfilePath(
                            localFile.getPath(),
                            perfil);

            if (exists(localPerfilPath)) {

                return new File(
                        localPerfilPath)
                        .getAbsolutePath();
            }
        }

        if (localFile.exists()) {

            return localFile.getAbsolutePath();
        }

        return rutaPropiedades;
    }

    private static String resolvePerfil(
            String rutaPropiedades) {
    	
    	//Intenta leer desde un archivo usando la ruta recibida por parámetro
    	String perfil =   resolvePerfilDesdeArchivo( rutaPropiedades);
    	if (perfil != null) {
    		System.out.println("perfil obtenido desde archivo "+ perfil);
            return perfil;
        }

    	//Propiedades del Sistema JVM
        perfil =
                normalize(
                        System.getProperty(
                                Constantes.SYSTEM_PROPERTY_PERFIL));

        if (perfil != null) {
        	System.out.println("perfil obtenido desde JVM "+ perfil);
            return perfil;
        }

        //Intenta leer de las Variables de Entorno del Sistema Operativo
        perfil =
                normalize(
                        System.getenv(
                                Constantes.ENV_PROFILE));

        if (perfil != null) {
        	System.out.println("perfil obtenido desde SO "+ perfil);
            return perfil;
        }
        System.out.println("perfil por defecto" );
        return "prod";

     
    }

    private static String resolvePerfilDesdeArchivo(
            String rutaArchivo) {
        if (!exists(rutaArchivo)) {
            return null;
        }

        java.util.Properties properties =
                new java.util.Properties();

        try (java.io.InputStream entrada =
                     new java.io.FileInputStream(
                             rutaArchivo)) {

            properties.load(entrada);

            return normalize(
                    properties.getProperty(
                            Constantes.SYSTEM_PROPERTY_PERFIL));

        } catch (Exception e) {

            return null;
        }
    }

    private static String resolveProfilePath(
            String rutaBase,
            String perfil) {

        if (rutaBase == null
                || rutaBase.trim().isEmpty()) {

            return null;
        }

        int extensionIndex =
                rutaBase.lastIndexOf(
                        ".properties");

        if (extensionIndex < 0) {
            return null;
        }

        return rutaBase.substring(
                0,
                extensionIndex)
                + "-"
                + perfil
                + ".properties";
    }

    private static String normalize(
            String value) {

        if (value == null) {
            return null;
        }

        String normalized =
                value.trim().toLowerCase();

        return normalized.isEmpty()
                ? null
                : normalized;
    }

    private static boolean exists(
            String path) {

        return path != null
                && !path.trim().isEmpty()
                && new File(path).exists();
    }

    public static void cerrarTransaccion(
            ParametrosIniciales param,
            Logger logger) {

        logger.info(
                "Tiempo de procesamiento (ms) "
                        + (System.currentTimeMillis()
                        - param.getTime()));

        ThreadContext.clearAll();
    }

    public static String getRUTA_PROPIEDADES() {
        return RUTA_PROPIEDADES;
    }

    public static String getNOMBRE_LOGGER() {
        return NOMBRE_LOGGER;
    }

    public static String getNOMBRE_APLICACION() {
        return NOMBRE_APLICACION;
    }

    public static String getPerfilActivo() {

        return resolvePerfil(
                RUTA_PROPIEDADES != null
                        ? RUTA_PROPIEDADES
                        : Constantes.RUTA_ARCHIVO_PROPIEDADES);
    }
}