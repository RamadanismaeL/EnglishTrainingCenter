import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { StudentComponent } from "../../_pages/Enrollment/student/student.component";
import { StepperEnrollmentService } from '../../_services/stepper-enrollment.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SucessEnrollmentComponent } from "../../_pages/Enrollment/sucess-enrollment/sucess-enrollment.component";
import { EnrollmentStudentService } from '../../_services/enrollment-student.service';
import { SettingService } from '../../_services/setting.service';
import { StudentPaymentCreateDto } from '../../_interfaces/student-payment-create-dto';
import { SnackBarService } from '../../_services/snack-bar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentsService } from '../../_services/students.service';
import { Subscription, switchMap } from 'rxjs';
import { NotificationHubService } from '../../_services/notification-hub.service';
import { EnrollmentPaymentService } from '../../_services/enrollment-payment.service';
import { CourseInfoModel } from '../../_interfaces/course-info-model';

@Component({
  selector: 'app-enrollment',
  imports: [
    MatStepperModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    StudentComponent,
    SucessEnrollmentComponent
],
  templateUrl: './enrollment.component.html',
  styleUrl: './enrollment.component.scss'
})
export class EnrollmentComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  previousAmountValue: string = '';
  form! : FormGroup;
  currentStep?: number;
  @ViewChild('stepperEnrollment') stepper!: MatStepper;
  enrollmentFee: string | undefined = '--';

  private subs = new Subscription();

  constructor(private stepperService: StepperEnrollmentService, private enrollmentStudentService: EnrollmentStudentService, private settingService: SettingService, private alert: SnackBarService, private studentService: StudentsService, private notificationHub: NotificationHubService, private enrollmentPaymentService: EnrollmentPaymentService)
  {
    this.subs.add(
      this.stepperService.activeStep$.subscribe(step => {
        this.currentStep = step;
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

  @ViewChild(StudentComponent) studentComponent!: StudentComponent;

  @ViewChild('studentPaymentFormRef') studentPaymentFormRef!: ElementRef<HTMLFormElement>;

  confirm() {
    if (!this.form.valid) {
      return;
    }

    //console.log("Student Data = ",this.enrollmentStudentService.currentEnrollment)

    this.subs.add(
      this.studentService.create(this.enrollmentStudentService.currentEnrollment).pipe(
        switchMap(() => this.studentService.getStudentById()),
        switchMap((studentId: string) => {
          const paymentDetails = this.createPaymentDetails(studentId);
          const courseInfo = this.createCourseInfo(studentId);

          this.enrollmentPaymentService.setEnrollmentStudent(paymentDetails);

          // Chamada para salvar o Course Info — Agora garantida no fluxo
          return this.studentService.createStudentCourseInfo(courseInfo).pipe(
            switchMap(() => {
              // Só após salvar o Course Info, ele cria o pagamento
              return this.studentService.createStudentPayment(this.createPaymentDetails(studentId));
            })
          );
        })
      ).subscribe({
        next: () => {
          this.studentComponent.resetForm();
          this.form.reset();
          this.studentPaymentFormRef.nativeElement.reset();
          this.enrollmentStudentService.clear();
          this.alert.show('Registration completed successfully!', 'success');
          this.notificationHub.sendMessage("Initialize enrollment form.");
          this.stepperService.setActiveStep(2);
        },
        error: (error) => {
          console.error("Erro no processo:", error);
          this.handleError(error);
        }
      })
    );
  }

  /*
  confirm() {
    if (!this.form.valid) {
      return;
    }

    this.subs.add(
      this.studentService.create(this.enrollmentStudentService.currentEnrollment).pipe(
        switchMap(() => this.studentService.getStudentById()),
        switchMap((studentId: string) =>
          this.studentService.getCourseFeeByLastId().pipe(
            switchMap((courseFeeId: string) => {
              const paymentDetails = this.createPaymentDetails(studentId, courseFeeId);
              const courseInfo = this.createCourseInfo(studentId);

              this.enrollmentPaymentService.setEnrollmentStudent(paymentDetails);

              return this.studentService.createStudentCourseInfo(courseInfo).pipe(
                switchMap(() =>
                  this.studentService.createStudentPayment(paymentDetails)
                )
              );
            })
          )
        )
      ).subscribe({
        next: () => {
          this.studentComponent.resetForm();
          this.form.reset();
          this.studentPaymentFormRef.nativeElement.reset();
          this.enrollmentStudentService.clear();
          this.alert.show('Registration completed successfully!', 'success');
          this.notificationHub.sendMessage("Initialize enrollment form.");
          this.stepperService.setActiveStep(2);
        },
        error: (error) => {
          console.error("Erro no processo:", error);
          this.handleError(error);
        }
      })
    );
  }
    */

  private createCourseInfo(studentId: string): CourseInfoModel {
    return {
      studentId: studentId,
      package: this.enrollmentStudentService.currentEnrollment.package,
      level: this.enrollmentStudentService.currentEnrollment.level,
      modality: this.enrollmentStudentService.currentEnrollment.modality,
      academicPeriod: this.enrollmentStudentService.currentEnrollment.academicPeriod,
      schedule: this.enrollmentStudentService.currentEnrollment.schedule
    };
  }

  private createPaymentDetails(studentId: string): StudentPaymentCreateDto {
    //const today = new Date();
    return {
      studentId: studentId,
      courseFeeId: null,
      receivedFrom: this.form.value.receivedFrom,
      description: 'Enrollment',
      method: this.form.value.paymentMethod,
      amountMT: this.parseNumber(this.enrollmentFee)
      /*
      times: today.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
        */
    };
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

