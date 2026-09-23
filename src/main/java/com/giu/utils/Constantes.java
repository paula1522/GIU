package com.giu.utils;

public class Constantes {
        private Constantes() {
        }

        public static final String RUTA_ARCHIVO_PROPIEDADES = "/applications/config/EAF/CO_Claro_IntCus_EAF_Domain_PR/config/GIU-BFF/giu.properties";

        // Intenta leer de las Variables de Entorno del Sistema JVM
        public static final String SYSTEM_PROPERTY_PERFIL = "system.giu.bff.profile";

        // Intenta leer de las Variables de Entorno del Sistema Operativo
        public static final String ENV_PROFILE = "GIU_BFF_PROFILE";
        // CONFIGURACION DE BASE DE DATOS PARA CARGUE DE PROPIEDADES
        public static final String PREFIJO_PROPIEDADES_BD = "system.db.";
        public static final String NOMBRE_JNDI_PARA_CARGUE_DE_PROPIEDADES = "system.db.jndi.name";
        public static final String NOMBRE_BD_GIU = "giu";

        public static final String APLICACION = "GIUBFF";
        public static final String NOMBRE_APLICACION_BASE_DATOS = "GIU_APP";
        public static final String CONSULTA_DE_PROPIEDADES = "system.db.query.parametros";

        // HAZELCAST CONFIGURATIONS
        public static final String HAZELCAST_CLUSTER_NAME = "system.hazelcast.cluster.name";
        public static final String HAZELCAST_MAP_SESSION_CACHE = "system.hazelcast.map.session.cache";
        public static final String DEFAULT_HAZELCAST_PORT = "system.hazelcast.default.port";
        public static final String HAZELCAST_TOKEN_MAP_NAME = "system.hazelcast.token.map.name";
        public static final String HAZELCAST_TOKEN_KEY = "system.hazelcast.token.key";

        public static final String APP_CORS_DOMAIN = "system.app.cors.domain";
        public static final String APP_PROXY_ALLOWED_TARGETS = "system.app.proxy.allowed.targets";
        public static final String TTL_NONCE_SECONDS = "system.app.ttl.nonce.seconds";
        public static final String APP_NODOS_CACHE = "system.app.nodos.cache";

        public static final String LOG_CONFIG_FILE = "system.data.base.logger.file.config";

        public static final String CONNECT_TIME_OUT_SERVICES_MILLISECONDS = "system.app.connect.timeout.services.milliseconds";

        public static final String CONNECTION_REQUEST_TIME_OUT_SERVICES_MILLISECONDS = "system.app.connection.request.timeout.services.milliseconds";

        public static final String SOCKET_TIME_OUT_SERVICES_MILLISECONDS = "system.app.socket.timeout.services.milliseconds";

        public static final String ENDPOINT_WS_SERGENERAL = "system.claro.proxies.ser-general-api";
        public static final String ENPOINT_AUDIT = "system.claro.proxies.endpoint.registro.auditoria";
        public static final String ENDPOINT_WS_GIU = "system.claro.proxies.giu-api";
        public static final String ENDPOINT_GENERATE_TOKEN_WS_GIU = "system.claro.auth.url";
        public static final String ENDPOINT_WS_SUCCESS_FACTOR = "system.claro.proxies.successFactor";

        public static final String WS_SER_GENERAL_CARGUE_MANUAL_IP_SFTP = "system.app.cargue.manual.puntos.ip.Sftp";
        public static final String WS_SER_GENERAL_CARGUE_MANUAL_USUARIO_SFTP = "system.app.cargue.manual.puntos.usuario.Sftp";
        public static final String WS_SER_GENERAL_CARGUE_MANUAL_PASSWORD_SFTP = "system.app.cargue.manual.puntos.contrasena.Sftp";
        public static final String WS_SER_GENERAL_CARGUE_MANUAL_PATH_SFTP = "system.app.cargue.manual.puntos.path.Sftp";

        // ==================== OPERACIONES ===================
        public static final int OPERACION_ASIGNAR = 0;
        public static final int OPERACION_RETIRAR = 1;
        public static final int OPERACION_VIGENCIA = 2;

        // ==================== OPERACIONES ESTADO ====================
        public static final int OPERACION_ACTIVAR = 0;
        public static final int OPERACION_BLOQUEAR = 1;
        public static final int OPERACION_INACTIVAR = 2;

        // ==================== VIGENCIA ====================
        public static final int VIGENCIA_ACTIVO = 1;
        public static final int VIGENCIA_TODOS = 0;


        // ==================== ESTADOS ====================
        public static final String ESTADO_ACTIVO = "ACTIVO";
        public static final String ESTADO_INACTIVO = "INACTIVO";

        // ==================== HEADERS ====================
        public static final String HDR_USUARIO_CREACION = "usuarioCreacion";
        public static final String HDR_USUARIO_MODIFICACION = "usuarioModificacion";

        // ==================== APLICACIONES ====================
        public static final String SQL_APLICACIONES_OBTENER = "system.pl.aplicaciones.obtener";
        public static final String SQL_APLICACIONES_OBTENER_ADMIN = "system.pl.aplicaciones.obtenerAdministrador";
        public static final String SQL_APLICACIONES_CREAR = "system.pl.aplicaciones.crear";
        public static final String SQL_APLICACIONES_MODIFICAR = "system.pl.aplicaciones.modificar";
        public static final String SQL_APLICACIONES_GESTIONAR_ADMIN = "system.pl.aplicaciones.gestionarAdministrador";

        // ==================== USUARIOS ====================
        public static final String SQL_USUARIOS_OBTENER = "system.pl.usuarios.obtener";
        public static final String SQL_USUARIOS_OBTENER_X_APLI = "system.pl.usuarios.obtenerXAplicacion";
        public static final String SQL_USUARIOS_OBTENER_ROL = "system.pl.usuarios.obtenerRol";
        public static final String SQL_USUARIOS_CREAR = "system.pl.usuarios.crear";
        public static final String SQL_USUARIOS_MODIFICAR = "system.pl.usuarios.modificar";
        public static final String SQL_USUARIOS_GESTIONAR_ROL = "system.pl.usuarios.gestionarRol";

        // ==================== SEGURIDAD ====================
        public static final String SQL_SEGURIDAD_GESTIONAR_ESTADO = "system.pl.seguridad.gestionarEstado";

        // ==================== ROLES ====================
        public static final String SQL_ROLES_OBTENER = "system.pl.roles.obtener";
        public static final String SQL_ROLES_RECURSOS = "system.pl.roles.recursos";
        public static final String SQL_ROLES_CREAR = "system.pl.roles.crear";
        public static final String SQL_ROLES_MODIFICAR = "system.pl.roles.modificar";
        public static final String SQL_ROLES_GESTIONAR_RECURSOS = "system.pl.roles.gestionar.recursos";

        // ==================== RECURSOS ====================
        public static final String SQL_RECURSOS_OBTENER = "system.pl.recursos.obtener";
        public static final String SQL_ROLES_RECURSO = "system.pl.recuros.roles";
        public static final String SQL_RECURSOS_OBTENER_USUARIO = "system.pl.recursos.obtenerUsuario";
        public static final String SQL_RECURSOS_CREAR = "system.pl.recursos.crear";
        public static final String SQL_RECURSOS_MODIFICAR = "system.pl.recursos.modificar";
}
