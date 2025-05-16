import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatMenuModule } from "@angular/material/menu";
import { CommonModule } from '@angular/common';
import { LoginService } from '../../_services/login.service';
import { SnackBarService } from '../../_services/snack-bar.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogSigOutComponent } from '../dialog-sig-out/dialog-sig-out.component';
import { FullScreenService } from '../../_services/full-screen.service';
import { TrainersService } from '../../_services/trainers.service';
import { NotificationHubService } from '../../_services/notification-hub.service';
import { Observable, Subscription } from 'rxjs';
import { TrainerDetailsDto } from '../../_interfaces/trainer-details-dto';
import { HttpErrorResponse } from '@angular/common/http';
import {MatDividerModule} from '@angular/material/divider';
import { BreadcrumbItem, TitleNavbarService } from '../../_services/title-navbar.service';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-ram-navbar',
  imports: [
    MatCardModule,
    MatIconModule,
    RouterLink,
    MatMenuModule,
    CommonModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './ram-navbar.component.html',
  styleUrl: './ram-navbar.component.scss'
})
export class RamNavbarComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);
  sideBar = new FormControl(this.positionOptions[2]);

  @Output() toggle = new EventEmitter<void>();
  change : boolean = sessionStorage.getItem('ramNavBarMenuiconchange') === 'true' ? true : false;
  private readonly message = inject(SnackBarService);
  isFullScreen = false;
  private readonly trainerService = inject(TrainersService);
  profileDetail!: Observable<TrainerDetailsDto>;
  private subs = new Subscription();
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(public dialog: MatDialog, private loginService: LoginService, private router: Router, private fullScreenService: FullScreenService, private notificationHub: NotificationHubService, private titleNavbarService: TitleNavbarService)
  {
    this.subs.add(
      this.titleNavbarService.breadcrumbs$.subscribe(bcs => {
        this.breadcrumbs = bcs;
      })
    );
  }

  navigateTo (breadcrumbs: { label: string, url?: any[] }[]) {
    this.titleNavbarService.setBreadcrumbs(breadcrumbs);
  }

  goPreviousTo() {
    const current = this.titleNavbarService.getBreadcrumbs();
    if (current.length >= 2) {
      const previous = current[current.length - 2];
      const updated = current.slice(0, current.length - 1);
      this.titleNavbarService.setBreadcrumbs(updated);

      if (previous.url) {
        this.router.navigate(previous.url);
      }
    }
  }

  goBackTo(label: string) {
    const current = this.titleNavbarService.getBreadcrumbs();
    const target = current.find(b => b.label === label);

    if (target) {
      const index = current.findIndex(b => b.label === label);
      const updated = current.slice(0, index + 1);

      this.titleNavbarService.setBreadcrumbs(updated);

      if (target.url) {
        this.router.navigate(target.url);
      }
    }
  }


  ngOnInit(): void {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        this.loadDetails();
      })
    );

    this.loadDetails();
  }

  ngOnDestroy(): void {
    // Cancela todas as inscrições para evitar vazamentos de memória
    this.subs.unsubscribe();
  }

  loadDetails() {
    this.profileDetail = this.trainerService.detail();
  }

  handleMenuClick()
  {
    this.change = !this.change;

    /*
    if(this.change === 'true')
    {
      this.message.show('Sidebar mini deactivated...', 'info');
    }
    else if(this.change === 'false') {
      this.message.show('Sidebar mini activated...', 'info');
    }
    */
  }

  toggleFullScren(): void {
    this.fullScreenService.toggleFullScreen(); // Aplica no documento inteiro
    // this.fullscreenService.toggleFullscreen('meu-elemento'); // Para um elemento específico
    this.isFullScreen = !this.isFullScreen;
  }

  refresh = () => {
    window.location.reload();
  }

  sigout = () => {
    const dialogRef = this.dialog.open(DialogSigOutComponent); // Comunicao com o model

    this.subs.add(
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loginService.logout().subscribe({
            next: (response) => {
              if (response.isSuccess) {
                this.message.show('Successfully signed out!', 'success');
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
      })
    );
  };
}
