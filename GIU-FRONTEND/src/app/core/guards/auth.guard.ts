import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/logic/auth.service';
import { APP_ROUTES } from '../../utils/constants/routes.constants';

/**
 * Guard que verifica autenticación.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree([APP_ROUTES.LOGIN], {
    queryParams: { returnUrl: state.url },
  });
};
