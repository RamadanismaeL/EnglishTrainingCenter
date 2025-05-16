import { CommonModule } from '@angular/common';
import { Component, OnDestroy, } from '@angular/core';
import { NetworkService } from '../../_services/network.service';
import { SnackBarService } from '../../_services/snack-bar.service';
import { Observable, Subscription } from 'rxjs';
import { LoginService } from '../../_services/login.service';
import { NotificationHubService } from '../../_services/notification-hub.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-network',
  imports: [
    CommonModule
  ],
  templateUrl: './network.component.html',
  styleUrl: './network.component.scss'
})
export class NetworkComponent implements OnDestroy {
  isOnline$ : Observable<boolean>;
  private subs = new Subscription();

  constructor(private networkService : NetworkService, private message : SnackBarService, private loginService: LoginService, private notificationHub: NotificationHubService, private router: Router)
  {
    this.isOnline$ = this.networkService.isOnline$; // Observable para o status da conexão

    this.subs.add(
      this.isOnline$.subscribe((isOnline) => {
        if (isOnline)
          {
            this.message.show('Connected to the internet. You are online.', 'success');
          }
          else
          {
            this.message.show('Oops! You are offline. Check your internet connection.', 'error');
            if (loginService.isLoggedIn())
            {
              this.loginService.logout().subscribe({
                next: (response) => {
                  if (response.isSuccess) {
                    //this.message.show('Successfully signed out!', 'success');
                    this.notificationHub.disconnect(); // Para a conexão do SignalR
                    // Navegar para a página de login após o logout ser concluído
                    this.router.navigateByUrl('/login', { replaceUrl: true });
                  } else {
                    this.message.show('Failed to sign out. Please try again later.', 'error');
                  }
                },
                error: (error : HttpErrorResponse) => {
                  if (error.status === 400) {
                    this.message.show('An error occurred while signing out.', 'error');
                  console.error('Logout error:', error);
                  }
                  else if (error.status === 401) {
                    this.message.show('Oops! Unauthorized!', 'error');
                  }
                  else if (error.status === 404) {
                    this.message.show('Oops! Not found!', 'error');
                  }
                  else if (error.status >= 500) {
                    this.message.show('Oops! The server is busy!', 'error');
                  }
                  else
                  {
                    this.message.show('Oops! An unexpected error occured.', 'error');
                  }
                }
              });
            }
          }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
