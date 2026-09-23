import { Routes } from '@angular/router';
import { APP_ROUTES } from './utils/constants/routes.constants';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { PERMISSIONS } from './utils/constants/permissions.constants';

export const routes: Routes = [
  {
    path: APP_ROUTES.INIT,
    redirectTo: APP_ROUTES.DASHBOARD,
    pathMatch: 'full',
  },
  {
    path: APP_ROUTES.LOGIN,
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: APP_ROUTES.DASHBOARD,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: APP_ROUTES.APPLICATIONS,
    canActivate: [authGuard, permissionGuard],
    data: { permiso: PERMISSIONS.APLICACIONES_VER },
    loadComponent: () => import('./pages/applications/applications-list/applications-list').then((m) => m.ApplicationsList),
  },
  {
    path: APP_ROUTES.APPLICATION_DETAIL,
    canActivate: [authGuard, permissionGuard],
    data: { permiso: PERMISSIONS.APLICACIONES_VER },
    loadComponent: () => import('./pages/applications/application-detail/application-detail').then((m) => m.ApplicationDetail),
  },
  {
    path: APP_ROUTES.APPLICATION_USERS,
    canActivate: [authGuard, permissionGuard],
    data: { permiso: PERMISSIONS.USUARIOS_VER },
    loadComponent: () => import('./pages/users/users-list/users-list').then((m) => m.UsersList),
  },
  {
    path: APP_ROUTES.APPLICATION_ROLES,
    canActivate: [authGuard, permissionGuard],
    data: { permiso: PERMISSIONS.ROLES_VER },
    loadComponent: () => import('./pages/roles/roles-list/roles-list').then((m) => m.RolesList),
  },
  {
    path: APP_ROUTES.APPLICATION_PERMISSIONS,
    canActivate: [authGuard, permissionGuard],
    data: { permiso: PERMISSIONS.PERMISOS_VER },
    loadComponent: () => import('./pages/permissions/permissions-list/permissions-list').then((m) => m.PermissionsList),
  },
  {
    path: APP_ROUTES.APPLICATION_ADMINS,
    canActivate: [authGuard, permissionGuard],
    data: { permiso: PERMISSIONS.ADMINISTRADORES_VER },
    loadComponent: () => import('./pages/administrators/administrators-list/administrators-list').then((m) => m.AdministratorsList),
  },
  {
    path: APP_ROUTES.USUARIOS_GLOBALES,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/users/users-global/users-global').then((m) => m.UsersGlobal),
  },
  {
    path: APP_ROUTES.AUDIT,
    canActivate: [authGuard, permissionGuard],
    data: { permiso: PERMISSIONS.AUDITORIA_VER },
    loadComponent: () => import('./pages/audit/audit').then((m) => m.Audit),
  },
  {
    path: APP_ROUTES.REPORTS,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/reports/reports').then((m) => m.Reports),
  },
  {
    path: APP_ROUTES.FORBIDDEN,
    loadComponent: () => import('./pages/forbidden/forbidden').then((m) => m.Forbidden),
  },
  {
    path: APP_ROUTES.NOT_FOUND,
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
