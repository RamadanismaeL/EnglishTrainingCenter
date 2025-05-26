import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { SnackBarService } from '../../_services/snack-bar.service';
import { TrainersService } from '../../_services/trainers.service';
import { NetworkService } from '../../_services/network.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-login-forgot-password',
  imports: [
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login-forgot-password.component.html',
  styleUrl: './login-forgot-password.component.scss'
})
export class LoginForgotPasswordComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly trainerService = inject(TrainersService);
  private readonly router = inject(Router);
  private readonly matSnackBar = inject(SnackBarService);
  private readonly networkService = inject(NetworkService);
  form! : FormGroup;

  private subs = new Subscription();

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      email : ['', [Validators.required, Validators.email]]
    });
  }

  get emailInput() {
    return this.form.get('email');
  }

  // Reset all forms errors
  private resetFormErrors() {
    this.form.get('email')?.setErrors(null);
    this.form.get('email')?.updateValueAndValidity();
  }

  submit() : void
  {
    this.resetFormErrors();

    if(!this.form.invalid)
    {
        // Verifica se o usuário está online
      if(this.networkService.isOnline)
      {
        this.subs.add(
          this.trainerService.forgotPassword(this.form.value).subscribe({
            next : () => {
              this.matSnackBar.show('Email sent successfully!', 'success');
              //console.log('Email sendo passado:', this.form.value.email);

              this.router.navigate(
                ['/login',
                { outlets : { loginRouter: ['validate-reset-code'] } }],
                { state : { email : this.form.value.email }} // Passa o email via estado
              );

              this.form.reset(); // limpa os campos

              // Limpa os erros manualmente
              Object.keys(this.form.controls).forEach(key => {
                this.form.get(key)?.setErrors(null);
              });
            },
            error: (error : HttpErrorResponse) => {
              if (error!.status === 400 || error!.status === 404)
                {
                  this.matSnackBar.show('Oops! Incorrect email...', 'error');
                }
                else
                {
                  this.matSnackBar.show('Oops! The server is busy. Please try again later.', 'error');
                }

              this.form.get('email')?.setErrors({ invalid : true });
            }
          })
        );
      }
      else
      {
        this.matSnackBar.show('Oops! You are offline. Check your internet connection.', 'error');
      }
    }
  }
}
