import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  // BehaviorSubject para armazenar e emitir o estado do loader
  // Estado inicial do loader
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Observable que outros componentes podem se inscrever para receber atualizações
  isLoading$ = this.isLoadingSubject.asObservable();

  // Exibir o loader
  show() { this.isLoadingSubject.next(true); }

  // Esconder o loader
  hide() { this.isLoadingSubject.next(false); }
}
