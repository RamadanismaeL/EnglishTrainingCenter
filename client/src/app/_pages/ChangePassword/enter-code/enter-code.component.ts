import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { TrainersService } from '../../../_services/trainers.service';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { LoginService } from '../../../_services/login.service';
import { StepperChangePasswordService } from '../../../_services/stepper-change-password.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-enter-code',
  imports: [
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './enter-code.component.html',
  styleUrl: './enter-code.component.scss'
})
export class EnterCodeComponent implements OnDestroy {
  private readonly trainerService = inject(TrainersService);
  private readonly loginService = inject(LoginService);
  private readonly matSnackBar = inject(SnackBarService);
  private readonly stepperState = inject(StepperChangePasswordService);

  form! : FormGroup;
  codeControls: FormControl[] = [];
  email = this.loginService.getUserDetail()?.email;

  private subs = new Subscription();

  constructor() {
    // Criar 6 campos
    this.codeControls = Array.from({ length: 6 }, () => new FormControl(''));
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
          this.stepperState.setActiveStep(2);
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
