export const APP_ROUTES = {
    // Rutas base (sin slash para el config de rutas)
    INIT: '',
    LOGIN: 'login',
    ERROR: 'error',
    HOME: 'home',
    MIGRACION: 'migracion',
    APP_ACTIONS: 'AppActions',
    MANAGE_USERS: 'mangeUsers',
    // Rutas completas (para usar en los router.navigate dentro de los componentes)
    FULL: {
      INIT: '/',
      ERROR: '/error',
      HOME: '/home',
      MIGRACION: '/migracion',
      MASIVOS: '/masivos',
      APP_ACTIONS: '/AppActions',
      MANAGE_USERS: '/mangeUsers',
    }
  } as const;