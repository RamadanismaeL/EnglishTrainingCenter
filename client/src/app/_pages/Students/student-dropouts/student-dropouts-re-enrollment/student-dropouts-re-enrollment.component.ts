import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, switchMap } from 'rxjs';
import { CourseInfoModel } from '../../../../_interfaces/course-info-model';
import { StudentPaymentCreateDto } from '../../../../_interfaces/student-payment-create-dto';
import { EnrollmentPaymentService } from '../../../../_services/enrollment-payment.service';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { SettingService } from '../../../../_services/setting.service';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { StudentsService } from '../../../../_services/students.service';
import { StudentEditPersonalDataService } from '../../../../_services/student-edit-personal-data.service';
import { CourseInfoReEnrollmentService } from '../../../../_services/course-info-re-enrollment.service';
import { EnrollmentDropFormComponent } from './enrollment-drop-form/enrollment-drop-form.component';
import { PaymentDropSuccessComponent } from './payment-drop-success/payment-drop-success.component';
import { StepperReEnrollmentDropService } from '../../../../_services/stepper-re-enrollment-drop.service';

@Component({
  selector: 'app-student-dropouts-re-enrollment',
  imports: [
    MatStepperModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    EnrollmentDropFormComponent,
    PaymentDropSuccessComponent
  ],
  templateUrl: './student-dropouts-re-enrollment.component.html',
  styleUrl: './student-dropouts-re-enrollment.component.scss'
})
export class StudentDropoutsReEnrollmentComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  previousAmountValue: string = '';
  form! : FormGroup;
  currentStepReDrop?: number;
  @ViewChild('stepperReEnrollmentDrop') stepper!: MatStepper;
  enrollmentFee: string | undefined = '--';
  private studentID : string = '';

  private subs = new Subscription();

  constructor(private stepperService: StepperReEnrollmentDropService, private studentEditPersonal: StudentEditPersonalDataService, private settingService: SettingService, private alert: SnackBarService, private studentService: StudentsService, private notificationHub: NotificationHubService, private enrollmentPaymentService: EnrollmentPaymentService, private courseInfoReEnrollment: CourseInfoReEnrollmentService)
  {
    this.subs.add(
      this.stepperService.activeStep$.subscribe(step => {
        this.currentStepReDrop = step;
      })
    );
  }

  ngAfterViewInit(): void {
    this.stepper._steps.forEach(step => { step.select = () => {}; })
  }

  resetStepper() {
    this.stepper.reset();
    this.stepperService.setActiveStep(0);
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
    this.subs.add(
      this.settingService.detailsAmountMt().subscribe(data => {
        const enr = data.find(d => d.id === 'EnrollmentFee');

        this.enrollmentFee = `${this.formatAmount(enr?.amountMT)} MT`;
      })
    );
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

  @ViewChild('studentPaymentReEnrollmentDropFormRef') studentPaymentFormRef!: ElementRef<HTMLFormElement>;

  confirm() {
    if (!this.form.valid) {
      return;
    }

    //console.log("Student Data = ",this.enrollmentStudentService.currentEnrollment)

    this.studentID = this.courseInfoReEnrollment.currentEnrollment.idStudent.toString();

    this.subs.add(
      this.studentService.update(this.studentEditPersonal.currentEnrollment).pipe(
        switchMap(() => {
          console.log('Student ID = ', this.studentID);
          const paymentDetails = this.createPaymentDetails(this.studentID);
          const courseInfo = this.createCourseInfo(this.studentID);

          this.enrollmentPaymentService.setEnrollmentStudent(paymentDetails);

          // Chamada para salvar o Course Info — Agora garantida no fluxo
          return this.studentService.createStudentCourseInfo(courseInfo).pipe(
            switchMap(() => {
              // Só após salvar o Course Info, ele cria o pagamento
              return this.studentService.createStudentPayment(this.createPaymentDetails(this.studentID));
            })
          );
        }),
        switchMap(() => {
          return this.studentService.updateStatus([this.studentEditPersonal.currentEnrollment.order ?? 0], 'Active');
        })
      ).subscribe({
        next: () => {
          this.alert.show('Re-enrollment updated successfully!', 'success');
          this.notificationHub.sendMessage("Initialize enrollment form.");
          this.stepperService.setActiveStep(2);
        },
        error: (error: HttpErrorResponse) => {
          console.error("Erro no processo:", error.error);
          this.handleError(error);
        }
      })
    );
  }

  private createCourseInfo(studentId: string): CourseInfoModel {
    return {
      studentId: studentId,
      package: this.courseInfoReEnrollment.currentEnrollment.package,
      level: this.courseInfoReEnrollment.currentEnrollment.level,
      modality: this.courseInfoReEnrollment.currentEnrollment.modality,
      academicPeriod: this.courseInfoReEnrollment.currentEnrollment.academicPeriod,
      schedule: this.courseInfoReEnrollment.currentEnrollment.schedule
    };
  }

  private createPaymentDetails(studentId: string): StudentPaymentCreateDto {
    //const today = new Date();
    return {
      studentId: studentId,
      courseFeeId: null,
      receivedFrom: this.capitalizeWords(this.form.value.receivedFrom),
      description: 'Enrollment',
      method: this.form.value.paymentMethod,
      amountMT: this.parseNumber(this.enrollmentFee)
    };
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

  private handleError(error: HttpErrorResponse) {
    if (error.status === 400) {
      this.alert.show('An error occurred.', 'error');
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
}

