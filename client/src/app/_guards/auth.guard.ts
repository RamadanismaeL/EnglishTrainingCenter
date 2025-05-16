import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../_services/login.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  // Verifica se o usuário está autenticado
  if (loginService.isLoggedIn()) {
    // Se o token está prestes a expirar, tenta renovar silenciosamente
    if (loginService.isTokenAboutToExpire()) {
      const userDetails = loginService.getUserDetail();
      const refreshToken = loginService.getRefreshToken();
      const currentToken = loginService.getToken();

      if (userDetails?.email && refreshToken && currentToken) {
        return loginService.refreshToken({
          token: currentToken,
          email: userDetails.email,
          refreshToken: refreshToken
        }).pipe(
          map(response => {
            if (response.isSuccess) {
              return true; // Permite acesso após refresh
            }
            // Se o refresh falhar, redireciona para login
            router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
          }),
          catchError(() => {
            router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return of(false);
          })
        );
      }
    }
    return true; // Token válido, permite acesso
  }

  // Se não estiver logado, redireciona para login mantendo a URL de destino
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
