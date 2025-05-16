import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { TrainersService } from '../../../_services/trainers.service';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TrainerChangePasswordDto } from '../../../_interfaces/trainer-change-password-dto';
import { LoginService } from '../../../_services/login.service';
import { StepperChangePasswordService } from '../../../_services/stepper-change-password.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forms',
  imports: [
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss'
})
export class FormsComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly trainerService = inject(TrainersService);
  private readonly loginService = inject(LoginService);
  private readonly matSnackBar = inject(SnackBarService);
  private readonly changePasswordDto = {} as TrainerChangePasswordDto;
  private readonly stepperState = inject(StepperChangePasswordService);

  form! : FormGroup;
  hideC : boolean = true; // Hide password and Show password
  hideN : boolean = true;
  hideCN : boolean = true;

  private subs = new Subscription();

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      currentPassword : ['', [Validators.required, Validators.minLength(6)]],
      newPassword : ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword : ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get currentPasswordInput() {
    return this.form.get('currentPassword');
  }

  get newPasswordInput() {
    return this.form.get('newPassword');
  }

  get confirmNewPasswordInput() {
    return this.form.get('confirmNewPassword');
  }

  private resetFormErrors() {
    ['currentPassword', 'newPassword', 'confirmNewPassword'].forEach(field => {
      this.form.get(field)?.setErrors(null);
      this.form.get(field)?.updateValueAndValidity();
    });
  }

  changePasswordHandler()
  {
    this.resetFormErrors();

    if(!this.form.invalid)
      {
        if(this.form.value.newPassword === this.form.value.confirmNewPassword)
        {
          this.changePasswordDto.currentPassword = this.form.value.currentPassword;
          this.changePasswordDto.email = this.loginService.getUserDetail()?.email;
          this.changePasswordDto.newPassword = this.form.value.newPassword;

          this.subs.add(
            this.trainerService.changePassword(this.changePasswordDto).subscribe({
              next : () => {
                this.form.reset(); // Limpa os campos

                // Limpa os erros manualmente
                Object.keys(this.form.controls).forEach(key => {
                  this.form.get(key)?.setErrors(null);
                });

                this.matSnackBar.show('Password changed successfully!', 'success');
                this.stepperState.setActiveStep(3);
              },
              error: (error : HttpErrorResponse) => {
                if (error.status === 400) {
                  this.matSnackBar.show('Oops! Failed to change the password. Please check your `current password` / `new password`, and try again....', 'error');
                }
                else if (error.status === 401) {
                  this.matSnackBar.show('Oops! Unauthorized!', 'error');
                }
                else if (error.status === 404) {
                  this.matSnackBar.show('Oops! Not found!', 'error');
                }
                else if (error.status >= 500) {
                  this.matSnackBar.show('Oops! The server is busy!', 'error');
                }
                else
                {
                  this.matSnackBar.show('Oops! An unexpected error occured.');
                }

                this.form.get('currentPassword')?.setErrors({ invalid : true });
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
}
