export const APP_ROUTES = {
    // Rutas base (sin slash para el config de rutas)
    INIT: '',
    LOGIN: 'login',
    ERROR: 'error',
    MIGRACION: 'migracion',
 
    // Nuevas rutas
    DASHBOARD: 'dashboard',
    APPLICATIONS: 'aplicaciones',
    APPLICATION_DETAIL: 'aplicaciones/:apliId',
    APPLICATION_USERS: 'aplicaciones/:apliId/usuarios',
    APPLICATION_ROLES: 'aplicaciones/:apliId/roles',
    APPLICATION_PERMISSIONS: 'aplicaciones/:apliId/permisos',
    APPLICATION_ADMINS: 'aplicaciones/:apliId/administradores',
    USUARIOS_GLOBALES: 'usuarios-globales',
    AUDIT: 'auditoria',
    REPORTS: 'reportes',
    FORBIDDEN: 'forbidden',
    NOT_FOUND: '**',
    // Rutas completas (para usar en los router.navigate dentro de los componentes)
    FULL: {
      INIT: '/',
      ERROR: '/error',
      HOME: '/home',
      MIGRACION: '/migracion',
      MASIVOS: '/masivos',
      APP_ACTIONS: '/AppActions',
      MANAGE_USERS: '/mangeUsers',
      DASHBOARD: '/dashboard',
      APPLICATIONS: '/aplicaciones',
      USUARIOS_GLOBALES: '/usuarios-globales',
      AUDIT: '/auditoria',
      REPORTS: '/reportes',
      FORBIDDEN: '/forbidden',
    }
  } as const;