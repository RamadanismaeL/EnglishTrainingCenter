import { Component, computed, ElementRef, Inject, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { NgxMaskDirective } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { SnackBarService } from '../../_services/snack-bar.service';
import { TrainersService } from '../../_services/trainers.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dialog-trainer-update',
  imports: [
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSelectModule,
    NgxMaskDirective,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './dialog-trainer-update.component.html',
  styleUrl: './dialog-trainer-update.component.scss'
})
export class DialogTrainerUpdateComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);

  private readonly fb = inject(FormBuilder);
  private readonly trainerService = inject(TrainersService);
  private readonly alert = inject(SnackBarService);
  private selectedFile: File | null = null;

  form! : FormGroup;
  urlImage: string | ArrayBuffer | null = null;
  checkurlImage : boolean = false;
  private subs: Subscription = new Subscription();

  private _fullName = signal('');
  public initialLetter = computed(() =>
    this._fullName().trim() ? this._fullName().trim()[0].toUpperCase() : ''
  );
  noPhoto : string = 'Profile Photo'

  constructor(public dialogRef : MatDialogRef<DialogTrainerUpdateComponent>, @Inject(MAT_DIALOG_DATA) public data: {id: string, profileImage: string, fullName: string, email: string, phoneNumber: string, position: string, status: number, roles: string[]})
  {
    //console.log('Dados recebidos: ',data)
  }

  ngOnInit(): void {
    this.initializeForm();

    this.subs.add(
      this.form.get('fullName')?.valueChanges
      .pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(value => {
        this._fullName.set(value || '');
      })
    );

    this.loadDetails();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      fullName : ['', [Validators.required, Validators.nullValidator, Validators.maxLength(250)]],
      email : ['', [Validators.required, Validators.email]],
      phoneNumber : ['', [Validators.required, Validators.nullValidator]],
      position : ['', [Validators.required, Validators.nullValidator]],
      status : ['', [Validators.required, Validators.nullValidator]],
      roles : ['', [Validators.required, Validators.nullValidator]]
    });

    if (this.data)
    {
      this.form.patchValue
      ({
        fullName : this.data.fullName,
        email : this.data.email,
        phoneNumber : this.data.phoneNumber,
        position : this.data.position,
        status : this.data.status == 1 ? 'active' : 'inactive',
        roles : this.data.roles[0] === 'Admin' ? 'admin' : 'user'
      });
    }
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  loadDetails() {
    if (this.data.profileImage)
    {
      this.checkurlImage = true;
      this.urlImage = this.data.profileImage;
    }
    else
    {
      this.checkurlImage = false;
      this.urlImage;
    }
    this._fullName.set(this.data.fullName);
  }

  @ViewChild('fileInput') fileInput!: ElementRef;
  isUploading = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedFile = file;

    // Verifica se é uma imagem
    if (!file.type.startsWith('image/')) {
      this.alert.show('Please select a valid image file', 'error');
      return;
    }

    this.isUploading = true;

    // Criar preview da imagem
    const reader = new FileReader();
    reader.onload = () => {
      this.urlImage = reader.result; // para exibir no <img [src]="urlImage">
      this.checkurlImage = true;
      this.isUploading = false;
    };
    reader.onerror = () => {
      this.alert.show('Failed to read file', 'error');
      this.isUploading = false;
    };

    reader.readAsDataURL(file);
  }

  deleteImage()
  {
    // Verifica se há uma imagem carregada
    if (!this.urlImage) {
      this.alert.show('No image to delete', 'info');
      return;
    }
    this.fileInput.nativeElement.value = ''; // Limpa o caminho do arquivo
    this.isUploading = false;
    this.selectedFile = null;
    this.urlImage = null;
    this.checkurlImage = false;

    //console.log('id Delete: ', this.data.id);
    const deleteSub = this.trainerService.deleteProfileImage(this.data.id).subscribe({
      next: (response) => {
        if (response.isSuccess) { this.alert.show('Profile photo deleted successfully', 'success')
        } else { this.alert.show('Failed to delete. Please try again later', 'error') }
      },
      error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
              this.alert.show('An error occurred while deleting.', 'error');
          } else if (error.status === 401) {
              this.alert.show('Oops! Unauthorized!', 'error');
          } else if (error.status === 404) {
              this.alert.show('Oops! Not found!', 'error');
          } else if (error.status >= 500) {
              this.alert.show('Oops! The server is busy!', 'error');
          } else {
              this.alert.show('Oops! An unexpected error occurred.', 'error');
          }
      }
    });
    this.subs.add(deleteSub);
  }

  onCancel()
  {
    this.dialogRef.close(false);
  }

  update() {
    if (this.form.valid)
    {
      const formDataToSend = new FormData(); // novo objecto
      // Monta o FormData
      formDataToSend.append('id', this.data.id);
      formDataToSend.append('fullName', this.form.value.fullName);
      formDataToSend.append('email', this.form.value.email);
      formDataToSend.append('phoneNumber', this.form.value.phoneNumber);
      formDataToSend.append('position', this.form.value.position);

      // Converter para número booleano (1 ou 0)
      const statusValue = this.form.value.status === 'active' ? 1 : 0;
      formDataToSend.append('status', statusValue.toString()); // Convertendo para string

      if (this.selectedFile) {
        formDataToSend.append('profileImage', this.selectedFile);
      }

      const rolesValue = this.form.value.roles === 'admin' ? 'Admin' : 'User'
      formDataToSend.append('roles', rolesValue.toString());

      // Chamada do serviço
      const updateSub = this.trainerService.update(formDataToSend).subscribe({
        next: () => {
          this.resetForm();
          this.alert.show('Trainer updated successfully!', 'success');
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
              this.alert.show('An error occurred while updating.', 'error');
          } else if (error.status === 401) {
              this.alert.show('Oops! Unauthorized!', 'error');
          } else if (error.status === 404) {
              this.alert.show('Oops! Not found!', 'error');
          } else if (error.status >= 500) {
              this.alert.show('Oops! The server is busy!', 'error');
          } else {
              this.alert.show('Oops! An unexpected error occurred.', 'error');
          }
          this.dialogRef.close(false);
        }
      });
      this.subs.add(updateSub);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private resetForm() {
  this.form.reset();
    this.urlImage = null;
    this.checkurlImage = false;

    // Limpa as validações e erros de forma eficiente
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.clearValidators(); // Limpa as validações
        control.setErrors(null); // Limpa os erros
        control.updateValueAndValidity(); // Atualiza o estado de validade
      }
    });
  }
}
