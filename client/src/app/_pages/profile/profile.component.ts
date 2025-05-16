import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TrainersService } from '../../_services/trainers.service';
import { CommonModule } from '@angular/common';
import { SnackBarService } from '../../_services/snack-bar.service';
import { NotificationHubService } from '../../_services/notification-hub.service';
import { TrainerDetailsDto } from '../../_interfaces/trainer-details-dto';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../../_services/login.service';

@Component({
  selector: 'app-profile',
  imports: [
    MatIconModule,
    CommonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly trainerService = inject(TrainersService);
  private readonly loginService = inject(LoginService);
  profileDetail$!: Observable<TrainerDetailsDto>;
  private subs = new Subscription();
  messages: string[] = [];
  isConnected = false;
  private readonly message = inject(SnackBarService);

  constructor(private notificationHub: NotificationHubService)
  {}

  ngOnInit(): void {
    // Escuta eventos do SignalR e atualiza os detalhes ao receber uma mensagem
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        this.loadDetails();
      })
    );

    // Carrega os detalhes pela primeira vez ao inicializar o componente
    this.loadDetails();
  }

  ngOnDestroy(): void {
    // Cancela todas as inscrições para evitar vazamentos de memória
    this.subs.unsubscribe();
  }

  loadDetails() {
    this.profileDetail$ = this.trainerService.detail();
  }

  @ViewChild('fileInput') fileInput!: ElementRef;
  isUploading = false;

  handleFileUpload(event: Event) {
    const formData = new FormData();
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validação básica
    if (!file.type.startsWith('image/')) {
      this.message.show('Please select an image file', 'error');
      return;
    }

    this.isUploading = true;

    formData.append('file', file); // Corresponde ao parâmetro do seu backend

    this.subs.add(
      this.trainerService.updateProfilePicture(formData).subscribe({
        next: () => {
          //this.message.show(response.message, 'success');
          this.isUploading = false;
          // Resetar o input para permitir novo upload do mesmo arquivo
          this.loadDetails();
          //this.fileInput.nativeElement.value = ''; // Limpa o caminho do arquivo
          input.value = '';
        },
        error: (error) => {
          this.message.show(error.error?.message || 'Upload failed', 'error');
          this.isUploading = false;
          this.fileInput.nativeElement.value = ''; // Limpa o caminho do arquivo
          input.value = '';
        }
      })
    );
  }

  deleteImage()
  {
    this.fileInput.nativeElement.value = ''; // Limpa o caminho do arquivo
    this.isUploading = false;

    //console.log('id Delete: ', this.data.id);
    const deleteSub = this.trainerService.deleteProfileImage(this.loginService.getUserDetail()?.id).subscribe({
      next: (response) => {
        if (response.isSuccess) { this.message.show('Profile photo deleted successfully', 'success')
        } else { this.message.show('Failed to delete. Please try again later', 'error') }
      },
      error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
              this.message.show('An error occurred while deleting.', 'error');
          } else if (error.status === 401) {
              this.message.show('Oops! Unauthorized!', 'error');
          } else if (error.status === 404) {
              this.message.show('Oops! Not found!', 'error');
          } else if (error.status >= 500) {
              this.message.show('Oops! The server is busy!', 'error');
          } else {
              this.message.show('Oops! An unexpected error occurred.', 'error');
          }
      }
    });
    this.subs.add(deleteSub);
  }
}
