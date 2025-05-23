import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { PaymentSuccessComponent } from "../../_pages/Payments/payment-success/payment-success.component";
import { PaymentPayComponent } from "../../_pages/Payments/payment-pay/payment-pay.component";
import { StepperPaymentService } from '../../_services/stepper-payment.service';
import { Subscription } from 'rxjs';
import { NotificationHubService } from '../../_services/notification-hub.service';
import { PaymentPayNowCreateService } from '../../_services/payment-pay-now-create.service';
import { PaymentPayNowService } from '../../_services/payment-pay-now.service';

@Component({
  selector: 'app-payment',
  imports: [
    MatStepperModule,
    MatIconModule,
    MatCardModule,
    PaymentSuccessComponent,
    PaymentPayComponent
],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit, OnDestroy {
  currentStep?: number;
  @ViewChild('stepperPayment') stepper!: MatStepper;
  private subs = new Subscription();

  constructor(private stepperService: StepperPaymentService, private notificationHub: NotificationHubService, private paymentPayNowCreate: PaymentPayNowCreateService, private paymentPayNow: PaymentPayNowService) {
    this.subs.add(
      this.stepperService.activeStep$.subscribe(step => {
        this.currentStep = step;
      })
    );
  }

  ngAfterViewInit(): void {
    this.stepper._steps.forEach(step => { step.select = () => {}; })
  }

  ngOnInit(): void {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        //this.loadDetails();
      })
    );
    //this.initializeForm();
    //this.loadDetails();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  @ViewChild(PaymentPayComponent) paymentComponent!: PaymentPayComponent;

  resetStepper() {
    this.paymentComponent.resetForm();
    this.paymentPayNowCreate.clear();
    this.stepper.reset();
    this.stepperService.setActiveStep(0);
  }
}
