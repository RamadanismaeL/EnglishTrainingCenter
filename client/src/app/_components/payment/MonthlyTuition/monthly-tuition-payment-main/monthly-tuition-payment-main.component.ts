import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom, Subscription, switchMap, timeout } from 'rxjs';
import { StudentPaymentCreateDto } from '../../../../_interfaces/student-payment-create-dto';
import { StudentComponent } from '../../../../_pages/Enrollment/student/student.component';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { SettingService } from '../../../../_services/setting.service';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { StepperEnrollmentService } from '../../../../_services/stepper-enrollment.service';
import { StudentsService } from '../../../../_services/students.service';
import { MonthlyTuitionPaymentSuccessComponent } from '../monthly-tuition-payment-success/monthly-tuition-payment-success.component';
import { PaymentPayNowCreateService } from '../../../../_services/payment-pay-now-create.service';
import { PaymentPayNowMonthlyTuitionService } from '../../../../_services/payment-pay-now-monthly-tuition.service';
import { StudentCourseInfoService } from '../../../../_services/student-course-info.service';

@Component({
  selector: 'app-monthly-tuition-payment-main',
  imports: [
    MatStepperModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MonthlyTuitionPaymentSuccessComponent
  ],
  templateUrl: './monthly-tuition-payment-main.component.html',
  styleUrl: './monthly-tuition-payment-main.component.scss'
})
export class MonthlyTuitionPaymentMainComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  previousAmountValue: string = '';
  form! : FormGroup;
  currentStep?: number;
  @ViewChild('stepperTuition') stepper!: MatStepper;
  enrollmentFee: string | undefined = '--';

  private subs = new Subscription();

  constructor(private stepperService: StepperEnrollmentService, private alert: SnackBarService, private studentService: StudentsService, private notificationHub: NotificationHubService, private payNowMonthlyTuition: PaymentPayNowMonthlyTuitionService, private studentCourseInfo: StudentCourseInfoService)
  {
    this.subs.add(
      this.stepperService.activeStep$.subscribe(step => {
        this.currentStep = step;
      })
    );
    this.stepperService.setActiveStep(0);
  }

  ngAfterViewInit(): void {
    this.stepper._steps.forEach(step => { step.select = () => {}; })
  }

  ngOnInit(): void {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        this.loadDetails();
      })
    );
    this.initializeForm();
    this.loadDetails();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadDetails()
  {
    this.enrollmentFee = `${this.formatAmount(this.payNowMonthlyTuition.currentEnrollment.amountToPay)} MT`;
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      receivedFrom : ['', [Validators.required, Validators.nullValidator]],
      paymentMethod : ['', [Validators.required, Validators.nullValidator]]
    });
  }

  formatAmount(value: number | undefined | string): string {
    if (value === null || value === undefined || value === '') return '';

    let numberValue: number;

    if (typeof value === 'string') {
      const cleanedValue = value.replace(/\./g, '').replace(',', '.');
      numberValue = parseFloat(cleanedValue);
    } else {
      numberValue = value;
    }

    if (isNaN(numberValue)) return '';

    // Formatação manual com regex
    return numberValue.toFixed(2)
      .replace('.', ',') // Substitui ponto decimal por vírgula
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona pontos nos milhares
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  parseNumber(formattedValue: string | undefined): number {
    // Converte "1.234,56" para 1234.56
    const numberString = formattedValue!.replace(/\./g, '').replace(',', '.');
    return parseFloat(numberString) || 0;
  }

  @ViewChild(StudentComponent) studentComponent!: StudentComponent;

  @ViewChild('studentPaymentTuitionFormRef') studentPaymentTuitionFormRef!: ElementRef<HTMLFormElement>;

  async confirm() {
    if (!this.form.valid || this.payNowMonthlyTuition == null) {
      this.alert.show('Please complete all required fields correctly', 'warning');
      return;
    }

    try {
      // 1. Criação do payload com validação adicional
      const paymentData = {
        studentId: this.payNowMonthlyTuition.currentEnrollment.studentId,
        courseFeeId: null,
        receivedFrom: this.capitalizeWords(this.form.value.receivedFrom.trim()),
        description: this.payNowMonthlyTuition.currentEnrollment.description,
        method: this.form.value.paymentMethod, // Default value
        amountMT: this.payNowMonthlyTuition.currentEnrollment.amountToPay
      };

      // 2. Processamento principal com tratamento de erros específico
      await lastValueFrom(
        this.studentService.createStudentPayment(paymentData).pipe(
          switchMap(() => {
            const orderRef = this.payNowMonthlyTuition.currentEnrollment?.orderMonthlyTuition;
            return this.studentCourseInfo.statusMonthlyTuition(
              typeof orderRef === 'number' ? orderRef : 0,
              "Paid"
            );
          }),
          timeout(8000) // Timeout para evitar chamadas penduradas
        )
      );

      // 3. Ações pós-sucesso
      this.payNowMonthlyTuition.clear();
      this.alert.show('Payment processed successfully!', 'success');
      this.notificationHub.sendMessage("Monthly tuition paid successfully");
      this.stepperService.setActiveStep(1);

    } catch (error) {
      console.error('Payment Error:', error);
    }
  }

  private capitalizeWords(value: string): string {
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
}

