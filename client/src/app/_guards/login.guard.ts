import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../_services/login.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isLoggedIn()) {
    // Se JÁ ESTIVER LOGADO, redireciona para outra página (ex.: dashboard)
    router.navigate(['/']); // Altere para sua rota padrão pós-login
    //router.navigate(['/', {outlets: {ramRouter: ['trainers']}}])
    return false; // BLOQUEIA o acesso ao /login
  }

  // Se NÃO ESTIVER LOGADO, PERMITE acesso ao /login
  return true;
};
