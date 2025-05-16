import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../_services/login.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, take, filter, finalize, from, Observable, BehaviorSubject } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(LoginService);
  const router = inject(Router);

  // Variáveis para controle do refresh token
  let isRefreshing = false;
  const refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // Helper function para adicionar o token à requisição
  const addTokenToRequest = (request: HttpRequest<any>, token: string | null): HttpRequest<any> => {
    return token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;
  };

  // Define rotas públicas que não precisam do token
  const noAuthRoutes = ['/sign-in', '/forgot-password', '/validate-reset-code', '/reset-password'];

  // Helper function para logout
  const logoutUser = (): void => {
    authService.clearAuthData();
    router.navigateByUrl('/login', { replaceUrl: true });
  };

  // Helper function para tratar erro 401
  const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      const currentToken = authService.getToken();
      const refreshToken = authService.getRefreshToken();
      const userDetails = authService.getUserDetail();

      if (!refreshToken || !userDetails?.email) {
        logoutUser();
        return throwError(() => new Error('Dados insuficientes para renovação do token'));
      }

      // Prepara o payload conforme sua API requer
      const refreshPayload = {
        token: currentToken || '', // Token antigo
        email: userDetails.email,  // Email do usuário
        refreshToken: refreshToken // Refresh token
      };

      return from(authService.refreshToken(refreshPayload)).pipe(
        switchMap((response: any) => {
          if (response.isSuccess) {
            refreshTokenSubject.next(response.token);
            return next(addTokenToRequest(request, response.token));
          } else {
            logoutUser();
            return throwError(() => new Error('Token refresh failed'));
          }
        }),
        catchError((error) => {
          logoutUser();
          return throwError(() => error);
        }),
        finalize(() => {
          isRefreshing = false;
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next(addTokenToRequest(request, token)))
      );
    }
  };

  // Se a URL atual for pública, segue sem adicionar Authorization
  if (noAuthRoutes.some(route => req.url.includes(route))) {
    return next(req);
  }

  // Adiciona token à requisição
  const authReq = addTokenToRequest(req, authService.getToken());

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq, next);
      }
      return throwError(() => error);
    })
  );
};
