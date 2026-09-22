import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/logic/auth.service';
import { APP_ROUTES } from '../../utils/constants/routes.constants';

/**
 * Guard que verifica permisos por ruta.
 * El permiso se define en `data: { permiso: 'CODIGO' }`.
 */
export const permissionGuard: CanActivateFn = (route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permiso = route.data?.['permiso'] as string | undefined;

  if (!permiso || auth.hasPermission(permiso)) return true;

  return router.createUrlTree([APP_ROUTES.FORBIDDEN]);
};
