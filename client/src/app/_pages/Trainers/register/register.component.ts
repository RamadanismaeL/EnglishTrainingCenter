import { Component, computed, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrainersService } from '../../../_services/trainers.service';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [
    MatInputModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    MatSelectModule,
    NgxMaskDirective,
    MatTooltipModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);

  private readonly fb = inject(FormBuilder);
  private readonly trainerService = inject(TrainersService);
  private readonly alert = inject(SnackBarService);
  private selectedFile: File | null = null;

  form! : FormGroup;
  hideN : boolean = true;
  hideCN : boolean = true;
  urlImage: string | ArrayBuffer | null = null;
  checkurlImage : boolean = false;

  private _fullName = signal('');
  public initialLetter = computed(() =>
    this._fullName().trim() ? this._fullName().trim()[0].toUpperCase() : ''
  );
  noPhoto : string = 'Profile Photo'

  private subs = new Subscription();

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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      fullName : ['', [Validators.required, Validators.nullValidator, Validators.maxLength(250)]],
      email : ['', [Validators.required, Validators.email]],
      phoneNumber : ['', [Validators.required, Validators.nullValidator]],
      position : ['', [Validators.required, Validators.nullValidator]],
      status : ['', [Validators.required, Validators.nullValidator]],
      roles : ['', [Validators.required, Validators.nullValidator]],
      newPassword : ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword : ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  loadDetails() {
    this.urlImage;
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
    this.alert.show('Profile photo deleted successfully', 'success')
  }

  capitalizeWords(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map(word =>
        word.length > 0
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : ''
      )
      .join(' ');
  }

  clear()
  {
    this.alert.show('Form cleared successfully!', 'success');
  }

  add() {
    if (this.form.valid) {
      if (this.form.value.newPassword === this.form.value.confirmNewPassword) {
        const formDataToSend = new FormData(); // novo objecto
        // Monta o FormData
        formDataToSend.append('fullName', this.capitalizeWords(this.form.value.fullName));
        formDataToSend.append('email', this.form.value.email.toLowerCase());
        formDataToSend.append('phoneNumber', this.form.value.phoneNumber);
        formDataToSend.append('position', this.capitalizeWords(this.form.value.position));
        formDataToSend.append('status', this.form.value.status);
        formDataToSend.append('password', this.form.value.newPassword);

        if (this.selectedFile) {
          formDataToSend.append('profileImage', this.selectedFile);
        }

        formDataToSend.append('roles', this.form.value.roles);
         /* Se for múltiplos roles:
      this.form.value.roles.forEach((role: string) => {
        formDataToSend.append('roles', role);
      });
      */

        // Chamada do serviço
        this.subs.add(
          this.trainerService.create(formDataToSend).subscribe({
            next: () => {
              this.resetForm();
              this.alert.show('Trainer created successfully!', 'success');
            },
            error: (error : HttpErrorResponse) => {
              if (error.status === 400) {
                this.alert.show(`Oops! Your password must be at least 6 characters long and include a combination of numbers, lowercase letters (a-z), uppercase letters (A-Z), and special characters (!$@%). - ${error.error.error.Message}`, 'warning');
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
          })
        );
      } else {
        this.alert.show('Oops! Passwords do not match.', 'error');
      }
    }
  }

  @ViewChild('registerFormRef') formElement!: ElementRef<HTMLFormElement>;

  private resetForm() {
    if (this.urlImage) {
      this.fileInput.nativeElement.value = ''; // Limpa o caminho do arquivo
      this.isUploading = false;
      this.selectedFile = null;
      this.urlImage = null;
      this.checkurlImage = false;
    }

    this.form.reset();
    this.formElement.nativeElement.reset();
  }
}
