import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { SnackBarService } from '../../_services/snack-bar.service';
import { TrainersService } from '../../_services/trainers.service';
import { TrainerResetPasswordDto } from '../../_interfaces/trainer-reset-password-dto';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-reset-password',
  imports: [
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './login-reset-password.component.html',
  styleUrl: './login-reset-password.component.scss'
})
export class LoginResetPasswordComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly trainerService = inject(TrainersService);
  private readonly router = inject(Router);
  private readonly matSnackBar = inject(SnackBarService);
  resetPassword = {} as TrainerResetPasswordDto;

  form! : FormGroup;
  hide : boolean = true; // Hide password and Show password
  hideC : boolean = true;

  private subs = new Subscription();

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.resetPassword.email = navigation.extras.state['email'];
    }
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      newPassword : ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword : ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get newPasswordInput() {
    return this.form.get('newPassword');
  }

  get confirmNewPasswordInput() {
    return this.form.get('confirmNewPassword');
  }

  // Reset all forms errors
  private resetFormErrors() {
    ['newPassword', 'confirmNewPassword'].forEach(field => {
      this.form.get(field)?.setErrors(null);
      this.form.get(field)?.updateValueAndValidity();
    });
  }

  resetPasswordHandler() : void
  {
    this.resetFormErrors();

    if(!this.form.invalid)
      {
        //console.log('New Password = ',this.form.value.newPassword)
        //console.log('Confirm New Password = ',this.form.value.confirmNewPassword)

        if(this.form.value.newPassword === this.form.value.confirmNewPassword)
        {
          this.resetPassword.newPassword = this.form.value.newPassword;
          //console.log('Reset : ',this.resetPassword);

          this.subs.add(
            this.trainerService.resetPassword(this.resetPassword).subscribe({
              next : () => {
                this.resetForm(); // limpa os campos

                this.matSnackBar.show('Password reset successful!', 'success');
                this.router.navigate(
                  ['/login',
                  { outlets : { loginRouter: ['ok'] } }]
                );
              },
              error: (error : HttpErrorResponse) => {
                if (error.status === 400) {
                  this.matSnackBar.show('Oops! Your password must be at least 6 characters long and include a combination of numbers, lowercase letters (a-z), uppercase letters (A-Z), and special characters (!$@%).', 'warning');
                } else if (error.status === 401) {
                    this.matSnackBar.show('Oops! Unauthorized!', 'error');
                } else if (error.status === 404) {
                    this.matSnackBar.show('Oops! Not found!', 'error');
                } else if (error.status >= 500) {
                    this.matSnackBar.show('Oops! The server is busy!', 'error');
                } else {
                    this.matSnackBar.show('Oops! An unexpected error occurred.', 'error');
                }

                this.form.get('newPassword')?.setErrors({ invalid : true });
                this.form.get('confirmNewPassword')?.setErrors({ invalid : true });
              }
            })
          );
        }
        else
        {
          this.matSnackBar.show('Oops! Passwords do not match.', 'error')
        }
      }
  }

  private resetForm() {
    this.form.reset();

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
