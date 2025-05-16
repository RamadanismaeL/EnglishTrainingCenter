import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { NotificationHubService } from '../../../_services/notification-hub.service';
import { StepperPaymentService } from '../../../_services/stepper-payment.service';

@Component({
  selector: 'app-payment-pay',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './payment-pay.component.html',
  styleUrl: './payment-pay.component.scss'
})
export class PaymentPayComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  form! : FormGroup;
  studentInfo_id : string | undefined = '--';
  studentInfo_fullName : string | undefined = '--';
  studentInfo_package : string | undefined = '--';
  studentInfo_level : string | undefined = '--';
  studentInfo_modality : string | undefined = '--';
  studentInfo_academicPeriod : string | undefined = '--';
  studentInfo_schedule : string | undefined = '--';
  studentInfo_amountMT : string | undefined = '--';

  private subs = new Subscription();

  constructor(private alert: SnackBarService,private notificationHub: NotificationHubService, private stepperService: StepperPaymentService) {
  }

  ngOnInit(): void {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        //this.loadDetails();
      })
    );
    this.initializeForm();
    //this.loadDetails();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      studentName : ['', [Validators.required, Validators.nullValidator]],
      receivedFrom : ['', [Validators.required, Validators.nullValidator]],
      transactionType : ['', [Validators.required, Validators.nullValidator]],
      paymentMethod : ['', [Validators.required, Validators.nullValidator]]
    });
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  confirm() {
    if (!this.form.valid) {
      this.stepperService.setActiveStep(1);
    }
  }
}
