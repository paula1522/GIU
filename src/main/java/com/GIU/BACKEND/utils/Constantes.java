package com.GIU.BACKEND.utils;

public class Constantes {
    private Constantes() {
    }
public static final String RUTA_ARCHIVO_PROPIEDADES = 
        "/applications/config/GIU-BFF/giu.properties";
    
  //Intenta leer de las Variables de Entorno del Sistema JVM
    public static final String SYSTEM_PROPERTY_PERFIL =
            "system.giu.bff.profile";
    
  //Intenta leer de las Variables de Entorno del Sistema Operativo
    public static final String ENV_PROFILE =
            "GIU_BFF_PROFILE";
    //CONFIGURACION DE BASE DE DATOS PARA CARGUE DE PROPIEDADES
    public static final String NOMBRE_JNDI_PARA_CARGUE_DE_PROPIEDADES =  "system.db.jndi.name";
    public static final String JDBC_CARGUE_DE_PROPS_URL =  "system.db.local.url";
    public static final String JDBC_CARGUE_DE_PROPS_USER =  "system.db.local.user";
    public static final String JDBC_CARGUE_DE_PROPS_PASSWORD =  "system.db.local.password";
    public static final String JDBC_CARGUE_DE_PROPS_DRIVER =  "system.db.local.driver";

    public static final String APLICACION = "GIUBFF";
    public static final String NOMBRE_APLICACION_BASE_DATOS = "GIU_APP";
    public static final String CONSULTA_DE_PROPIEDADES = "system.db.query.parametros";

       
 // HAZELCAST CONFIGURATIONS
    public static final String HAZELCAST_CLUSTER_NAME = "system.hazelcast.cluster.name";
    public static final String HAZELCAST_MAP_SESSION_CACHE = "system.hazelcast.map.session.cache";
    public static final String DEFAULT_HAZELCAST_PORT = "system.hazelcast.default.port";
    public static final String  HAZELCAST_TOKEN_MAP_NAME = "system.hazelcast.token.map.name";
    public static final String  HAZELCAST_TOKEN_KEY = "system.hazelcast.token.key";
    

    public static final String APP_CORS_DOMAIN = "system.app.cors.domain";
    public static final String APP_PROXY_ALLOWED_TARGETS = "system.app.proxy.allowed.targets";
    public static final String TTL_NONCE_SECONDS = "system.app.ttl.nonce.seconds";
    public static final String APP_NODOS_CACHE = "system.app.nodos.cache";

    public static final String LOG_CONFIG_FILE = "system.data.base.logger.file.config";

    public static final String CONNECT_TIME_OUT_SERVICES_MILLISECONDS =
            "system.app.connect.timeout.services.milliseconds";

    public static final String CONNECTION_REQUEST_TIME_OUT_SERVICES_MILLISECONDS =
            "system.app.connection.request.timeout.services.milliseconds";

    public static final String SOCKET_TIME_OUT_SERVICES_MILLISECONDS =
            "system.app.socket.timeout.services.milliseconds";
    
    public static final String ENDPOINT_WS_SERGENERAL ="system.claro.proxies.ser-general-api";
    public static final String ENPOINT_AUDIT = "system.claro.proxies.endpoint.registro.auditoria";
    public static final String ENDPOINT_WS_GIU = "system.claro.proxies.giu-api";
    public static final String ENDPOINT_GENERATE_TOKEN_WS_GIU = "system.claro.auth.url";
    public static final String ENDPOINT_WS_SUCCESS_FACTOR = "system.claro.proxies.successFactor";
    
    
	public static final String WS_SER_GENERAL_CARGUE_MANUAL_IP_SFTP = "system.app.cargue.manual.puntos.ip.Sftp";
	public static final String WS_SER_GENERAL_CARGUE_MANUAL_USUARIO_SFTP = "system.app.cargue.manual.puntos.usuario.Sftp";
	public static final String WS_SER_GENERAL_CARGUE_MANUAL_PASSWORD_SFTP = "system.app.cargue.manual.puntos.contrasena.Sftp";
	public static final String WS_SER_GENERAL_CARGUE_MANUAL_PATH_SFTP = "system.app.cargue.manual.puntos.path.Sftp";
}
