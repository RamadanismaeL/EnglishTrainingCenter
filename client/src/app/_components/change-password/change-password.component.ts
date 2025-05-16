import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { FormsComponent } from "../../_pages/ChangePassword/forms/forms.component";
import { CommonModule } from '@angular/common';
import { LoginService } from '../../_services/login.service';
import { EnterCodeComponent } from "../../_pages/ChangePassword/enter-code/enter-code.component";
import { StepperChangePasswordService } from '../../_services/stepper-change-password.service';
import { TrainersService } from '../../_services/trainers.service';
import { SnackBarService } from '../../_services/snack-bar.service';
import { NetworkService } from '../../_services/network.service';
import { TrainerSendNewCode } from '../../_interfaces/trainer-send-new-code';
import { SuccessComponent } from "../../_pages/ChangePassword/success/success.component";
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-password',
  imports: [
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    FormsComponent,
    CommonModule,
    EnterCodeComponent,
    SuccessComponent,
    MatCardModule
],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements AfterViewInit, OnDestroy {
  private readonly networkService = inject(NetworkService);
  private readonly trainerService = inject(TrainersService);
  private readonly matSnackBar = inject(SnackBarService);
  private readonly loginService = inject(LoginService);
  email = this.loginService.getUserDetail()?.email;
  fullName = this.loginService.getUserDetail()?.fullName;
  currentStep?: number;
  dataUser = {} as TrainerSendNewCode;
  @ViewChild('stepper') stepper!: MatStepper;

  private subs = new Subscription();

  constructor(private stepperState: StepperChangePasswordService) {
    this.subs.add(
      this.stepperState.activeStep$.subscribe(step => {
        this.currentStep = step;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.stepper._steps.forEach(step => { step.select = () => {}; })
  }

  resetStepper() {
    this.stepper.reset();
    this.stepperState.setActiveStep(0);
  }

  submit() {
    if(this.networkService.isOnline$)
    {
      this.dataUser.email = this.email;
      this.dataUser.name = this.fullName;

      if(this.dataUser !== null)
      {
        this.subs.add(
          this.trainerService.sendNewCode(this.dataUser).subscribe({
            next : () => {
              this.matSnackBar.show('Email sent successfully!', 'info');
              this.stepperState.setActiveStep(1);
            },
            error : () => this.matSnackBar.show('Oops! The server is busy. Please try again later.', 'error')
          })
        );
      }
    }
    else
    {
      this.matSnackBar.show('Oops! You are offline. Check your internet connection.', 'error');
    }
  }
}
