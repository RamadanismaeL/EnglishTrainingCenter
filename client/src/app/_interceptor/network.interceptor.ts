import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NetworkService } from '../_services/network.service';
import { throwError } from 'rxjs';

export const networkInterceptor: HttpInterceptorFn = (req, next) => {
  const networkService = inject(NetworkService);

  // Verifica se a requisação possui um cabeçalho específico para ignorar a verificação de rede
  const allowOffline = req.headers.has('Allow-Offline');

  // Se a requisição não permitir offline e o usuário estiver offline, retorne um erro
  if (!allowOffline && !networkService.isOnline) {
    // Se o usuário estiver offline, retorne um erro
    return throwError(() => new Error('You are offline. Check your internet connection.'));
  }

  // Se o usuário estiver online ou a requisição permitir offline de acordo com o header acima, continue com a requisição
  return next(req);
};
