# GIU — Gestión Integral de Usuarios

Aplicación frontend Angular para la administración centralizada de usuarios, aplicaciones, roles, permisos y auditoría.

## Tecnologías

- **Angular 20.3** (standalone components)
- **Angular Material 20**
- **Bootstrap Icons**
- **ngx-cookie-service**
- **node-forge** (criptografía)
- **moment-timezone**
- **TypeScript 5.9**
- **SCSS** con design tokens (color corporativo rojo `#e92012`)

## Arquitectura frontend

```
src/app/
├── app.ts                    # Componente raíz
├── app.config.ts             # Providers (router, http, crypto)
├── app.routes.ts             # Routing con lazy loading y guards
├── core/
│   ├── enums/                # Enums de dominio
│   └── guards/               # authGuard, permissionGuard
├── models/
│   ├── api/                  # Modelos de API (auth, token)
│   └── domain/               # Modelos de dominio (giu.models.ts)
├── pages/
│   ├── login/                # Login existente
│   ├── home/                 # Home existente
│   ├── app-actions/          # Acciones de aplicación
│   ├── manage-users/         # Gestión de usuarios existente
│   ├── dashboard/            # Dashboard global
│   ├── applications/         # CRUD de aplicaciones
│   ├── users/                # Lista de usuarios por aplicación
│   ├── roles/                # Lista de roles por aplicación
│   ├── permissions/          # Lista de permisos/recursos
│   ├── administrators/       # Administradores por aplicación
│   ├── audit/                # Auditoría con filtros
│   ├── reports/              # Reportes con tabs y exportación
│   ├── forbidden/            # Página 403
│   └── not-found/            # Página 404
├── services/
│   ├── api/                  # Servicios de API reales
│   ├── logic/                # Servicios de lógica (auth, crypto)
│   └── mock/                 # Servicios mock para desarrollo
├── shared/
│   ├── atomic-desing/        # Componentes atómicos (atoms)
│   ├── molecule/             # Componentes moleculas
│   ├── header/               # Header existente
│   ├── layout/               # Layout principal con sidebar
│   └── encrypted-http-client # Cliente HTTP cifrado
└── utils/
    ├── constants/            # Constantes (rutas, permisos, mensajes)
    └── Utils.service.ts      # Utilidades
```

## Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start

# Compilación
npm run build

# Pruebas
npm test
```

## Modelo de autorización

- **Super Administrador:** acceso total a todas las funcionalidades.
- **Administrador de Aplicación:** acceso únicamente a las aplicaciones asignadas.
- **Permisos genéricos:** `APLICACIONES_VER`, `USUARIOS_CREAR`, `ROLES_EDITAR`, etc.
- **Guards:** `authGuard` verifica sesión; `permissionGuard` verifica permisos por ruta.
- **AuthService:** centraliza `hasPermission()` y `hasAnyPermission()`.

## Servicios mock

Los servicios mock simulan respuestas del backend hasta que los endpoints REST estén disponibles:

| Servicio | Descripción |
|---|---|
| `ApplicationMockService` | CRUD de aplicaciones |
| `UserMockService` | CRUD de usuarios |
| `RoleMockService` | CRUD de roles y recursos |
| `AuditMockService` | Consulta de eventos de auditoría |
| `ReportMockService` | Reportes con datos simulados |

## Funcionalidades implementadas

- Login con sesión mock
- Dashboard con métricas
- CRUD de aplicaciones (listar, crear, editar, activar/inactivar)
- Listado de usuarios por aplicación
- Listado de roles por aplicación
- Listado de permisos/recursos por aplicación
- Listado de administradores por aplicación
- Auditoría con filtros y drawer de detalle
- Reportes con tabs y exportación CSV
- Páginas 403 y 404
- Layout con sidebar colapsable
- Guards de autenticación y permisos

## Limitaciones reales

- El login es mock hasta que el backend implemente autenticación real.
- Los datos son simulados; no hay conexión real con el backend.
- Los formularios de creación/edición de usuarios y roles están pendientes.
- La asignación de roles a usuarios y recursos a roles está pendiente.

## Pendientes relacionados con el backend

- Endpoint de login real (`/auth/login`)
- Endpoints de CRUD de usuarios, roles, recursos
- Endpoint de auditoría
- Endpoints de reportes
- Endpoint de administradores por aplicación
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
