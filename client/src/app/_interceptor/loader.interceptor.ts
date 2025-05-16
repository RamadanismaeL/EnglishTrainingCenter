import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../_services/loader.service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const loaderService = inject(LoaderService); // Injeta o LoaderService

  //console.log('Interceptor: Exibindo loader');
  loaderService.show(); // Exibe o loader antes de iniciar a requisição

  return next(req).pipe(
    finalize(() => {
      //console.log('Interceptor: Escondendo loader');
      loaderService.hide(); // Esconde o loader quando a requisição é concluída (sucesso ou erro)
    })
  );

  /*
  const skipLoader = req.headers.has('Allow-Offline');

  if (!skipLoader) {
    loaderService.show(); // ou qualquer lógica de exibir loader
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipLoader) {
        loaderService.hide(); // ou remover loader
      }
    })
  );
  */
};
