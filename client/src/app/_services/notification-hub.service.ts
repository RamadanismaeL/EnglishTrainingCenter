import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationHubService {
  private readonly hubUrl: string = environment.hubUrl;
  private hubConnection?: HubConnection;
  private connectionSubject = new Subject<boolean>();
  private readonly authService = inject(LoginService);

  constructor() {
    this.buildConnection();
  }

  private buildConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}/notificationHub`, {
        accessTokenFactory: () => this.authService.getToken() || '',
        withCredentials: true,
        skipNegotiation: false, // Mantenha false para negociação padrão
        transport: HttpTransportType.WebSockets
      })
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    this.registerBasicEvents();
  }

  private registerBasicEvents(): void {
    this.hubConnection!.onclose(error => {
      console.warn('Conexão SignalR fechada', error);
      this.connectionSubject.next(false);
      if (error) {
        this.tryRestartConnection();
      }
    });

    this.hubConnection!.onreconnecting(error => {
      console.log('Reconectando SignalR...', error);
      this.connectionSubject.next(false);
    });

    this.hubConnection!.onreconnected(connectionId => {
      console.log('SignalR reconectado. Nova ConnectionId:', connectionId);
      this.connectionSubject.next(true);
    });
  }

  async startConnection(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    try {
      await this.hubConnection?.start();
      console.log('SignalR conectado com sucesso');
      this.connectionSubject.next(true);
    } catch (error) {
      console.error('Erro ao conectar SignalR:', error);
      this.connectionSubject.next(false);
      this.tryRestartConnection();
    }
  }

  private async tryRestartConnection(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 5000));
    this.startConnection();
  }

  public get connectionStatus$(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  public async sendMessage(message: string): Promise<void> {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      return Promise.reject('Conexão não está ativa');
    }
    return this.hubConnection.invoke('SendMessageToAll', message)
      .catch(err => {
        console.error('Erro ao enviar mensagem:', err);
        throw err;
      });
  }

  public receiveMessage(): Observable<string> {
    return new Observable<string>(observer => {
      const handler = (message: string) => observer.next(message);
      this.hubConnection?.on('ReceiveMessage', handler);

      return () => this.hubConnection?.off('ReceiveMessage', handler);
    });
  }

  async disconnect(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.stop();
        console.log('SignalR desconectado com sucesso');
        this.connectionSubject.next(true);
      } catch (error) {
        console.error('Erro ao desconectado SignalR:', error);
        this.connectionSubject.next(false);
      }
    }
  }
}
