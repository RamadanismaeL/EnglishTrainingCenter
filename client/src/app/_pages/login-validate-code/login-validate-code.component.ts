import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SnackBarService } from '../../_services/snack-bar.service';
import { TrainersService } from '../../_services/trainers.service';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-login-validate-code',
  imports: [
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login-validate-code.component.html',
  styleUrl: './login-validate-code.component.scss'
})
export class LoginValidateCodeComponent implements OnDestroy {
  private readonly trainerService = inject(TrainersService);
  private readonly matSnackBar = inject(SnackBarService);
  private readonly router = inject(Router);

  form! : FormGroup;
  codeControls: FormControl[] = [];
  email: string = '';

  private subs = new Subscription();

  constructor() {
    // Criar 6 campos
    this.codeControls = Array.from({ length: 6 }, () => new FormControl(''));

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.email = navigation.extras.state['email'];
      //console.log("Email recebido : ",this.email);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onInput(event: any, index: number) {
    const input = event.target;
    const value = input.value;

    // Handle Backspace key
    if (event.key === 'Backspace' && !value && index > 0) {
      const prevInput: HTMLElement | null = input
        .closest('mat-form-field')
        ?.previousElementSibling
        ?.querySelector('input');

      prevInput?.focus();
      return;
    }

    // Se digitou algo e não for número, remove
    if (!/^\d$/.test(value)) {
      input.value = '';
      this.codeControls[index].setValue('');
      return;
    }

    // Vai pro próximo campo se existir
    if (value && index < this.codeControls.length - 1) {
      // Acha o próximo input pela posição no DOM
      const nextInput : HTMLElement | null = input.closest('mat-form-field')?.nextElementSibling?.querySelector('input');

      nextInput?.focus();
    }

    // Verifica se todos os campos estão preenchidos
    if(this.codeControls.every(control => control.value))
    {
      this.submit();
    }
  }

  submit() {
    //Junta os valores do código em uma string
    const code = this.codeControls.map(control => control.value).join('');
    //console.log('Join Code: ',code,' and email: ',this.email);

    const requestData = {
      email: this.email,
      code: code
    };
    //console.log("Request Data: ",requestData)
    this.subs.add(
      this.trainerService.validateResetCode(requestData).subscribe({
        next: () => {
          // Exibe mensagem de sucesso
          this.matSnackBar.show('Code validated successfully!', 'success');
          this.router.navigate(
            ['/login',
            { outlets : { loginRouter: ['reset-password'] } }],
            { state : { email : requestData.email }} // Passa o email via estado
          );

          //console.log('Email enviado : ',requestData.email);
        },
        error: (error : HttpErrorResponse) => {
          if (error!.status === 400 || error!.status === 404)
            {
              this.matSnackBar.show('Invalid or expired code.', 'error');
            }
            else
            {
              this.matSnackBar.show('Oops! The server is busy. Please try again later.', 'error');
            }
        }
      })
    );
  }
}
