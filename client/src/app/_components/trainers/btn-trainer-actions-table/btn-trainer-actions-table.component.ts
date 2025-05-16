import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { DialogDeleteComponent } from '../../dialog-delete/dialog-delete.component';
import { TrainersService } from '../../../_services/trainers.service';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogTrainerUpdateComponent } from '../../dialog-trainer-update/dialog-trainer-update.component';
import { Subscription } from 'rxjs';
import { LoginService } from '../../../_services/login.service';
import { NotificationHubService } from '../../../_services/notification-hub.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'app-btn-trainer-actions-table',
  imports: [
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './btn-trainer-actions-table.component.html',
  styleUrl: './btn-trainer-actions-table.component.scss'
})
export class BtnTrainerActionsTableComponent implements ICellRendererAngularComp, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  positionL = new FormControl(this.positionOptions[2]);
  positionR = new FormControl(this.positionOptions[3]);

  params: any;
  private subs: Subscription = new Subscription();

  constructor (private dialog: MatDialog, private trainerService: TrainersService, private alert: SnackBarService, private loginService: LoginService, private notificationHub: NotificationHubService, private router: Router)
  {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onEdit() {
    //console.log('Editar:', this.params.data);
    this.dialog.open(DialogTrainerUpdateComponent, {
      data:
      {
        id: this.params.data.id,
        profileImage: this.params.data.profileImage,
        fullName: this.params.data.fullName,
        email: this.params.data.email,
        phoneNumber: this.params.data.phoneNumber,
        position: this.params.data.position,
        status: this.params.data.status,
        roles: this.params.data.roles
      }
    });
  }

  onDelete() {
    //console.log('Deletar:', this.params.data);
    const myId = this.loginService.getUserDetail()?.id;
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
        data: { fullName: this.params.data.fullName }
    });
    const dialogSub = dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
            const deleteSub = this.trainerService.delete(this.params.data.id).subscribe({
                next: (response) => {
                    if (response.isSuccess) {
                        this.alert.show('Trainer deleted successfully!', 'success');
                    } else {
                        this.alert.show('Failed to delete. Please try again later', 'error');
                    }

                    if (this.params.data.id === myId)
                    {
                      //console.log("Entrou Params ID : ",this.params.data.id, " = myId : ",myId)

                      this.alert.show('Your account was deleted successfully!', 'success');
                      this.notificationHub.disconnect(); // Para a conexão do SignalR
                      this.loginService.clearAuthData();
                      // Navegar para a página de login após o logout ser concluído
                      this.router.navigateByUrl('/login', { replaceUrl: true });
                    }
                },
                error: (error: HttpErrorResponse) => {
                    if (error.status === 400) {
                        this.alert.show('An error occurred while deleting.', 'error');
                    } else if (error.status === 401) {
                        this.alert.show('Oops! Unauthorized!', 'error');
                    } else if (error.status === 403) {
                        this.alert.show('Oops! Access denied. You do not have permission.', 'error');
                    } else if (error.status === 404) {
                      this.alert.show('Oops! Not found!', 'error');
                    }  else if (error.status >= 500) {
                        this.alert.show('Oops! The server is busy!', 'error');
                    } else {
                        this.alert.show('Oops! An unexpected error occurred.', 'error');
                    }
                }
            });
            this.subs.add(deleteSub);
          }
      });

      this.subs.add(dialogSub);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
