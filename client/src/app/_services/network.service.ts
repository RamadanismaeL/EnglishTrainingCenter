import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  // Estado inicial da conexão
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);

  // Observable para os estados da conexão
  isOnline$ = this.isOnlineSubject.asObservable();

  constructor() {
    // Monitora mudanças no status da conexão
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }

  // Atualiza o status da conexão
  private updateOnlineStatus(): any {
    this.isOnlineSubject.next(navigator.onLine);
  }

  // Retorna o valor atual do status da conexão
  get isOnline(): boolean {
    return this.isOnlineSubject.value;
  }
}
