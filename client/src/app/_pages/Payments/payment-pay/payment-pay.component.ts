import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { catchError, debounceTime, distinctUntilChanged, filter, map, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
import { NotificationHubService } from '../../../_services/notification-hub.service';
import { StepperPaymentService } from '../../../_services/stepper-payment.service';
import { StudentDataModel } from '../../../_interfaces/student-data-model';
import { StudentsService } from '../../../_services/students.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { SettingAmountMtDetailsDto } from '../../../_interfaces/setting-amount-mt-details-dto';
import { SettingService } from '../../../_services/setting.service';
import { PaymentPayNowService } from '../../../_services/payment-pay-now.service';
import { PaymentPayNowCreateService } from '../../../_services/payment-pay-now-create.service';

export interface StateGroup {
  letter: string;
  names: string[];
  students?: StudentDataModel[];
}

@Component({
  selector: 'app-payment-pay',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    AsyncPipe
  ],
  templateUrl: './payment-pay.component.html',
  styleUrl: './payment-pay.component.scss'
})
export class PaymentPayComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  form! : FormGroup;

  filteredStudents$!: Observable<StudentDataModel[]>;
  allStudents: StudentDataModel[] = []; // Armazena a lista completa

  private amountMt$!: Observable<SettingAmountMtDetailsDto[]>;

  studentInfo_id : string | undefined = '--';
  studentInfo_fullName : string | undefined = '--';
  studentInfo_package : string | undefined = '--';
  studentInfo_level : string | undefined = '--';
  studentInfo_modality : string | undefined = '--';
  studentInfo_academicPeriod : string | undefined = '--';
  studentInfo_schedule : string | undefined = '--';
  studentInfo_amountMT : string | undefined = '--';

  private subs = new Subscription();

  constructor(private notificationHub: NotificationHubService, private stepperService: StepperPaymentService, private studentService: StudentsService, private settingService: SettingService, private paymentPayNow: PaymentPayNowService, private paymentPayNowCreate: PaymentPayNowCreateService)
  {}

  ngOnInit(): void {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        this.loadDetails();
      })
    );
    this.initializeForm();
    this.loadDetails();
  }

  loadDetails()
  {
    this.amountMt$ = this.settingService.detailsAmountMt();
    // Primeiro carrega todos os estudantes
    this.subs.add(
      this.studentService.detailStudentData().subscribe(students => {
        this.allStudents = Array.isArray(students) ? students : [students];
      })
    );

    // Configura o autocomplete
    this.filteredStudents$ = this.form.get('studentName')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (value && typeof value === 'object') {
          return of([value]); // Mostra apenas o estudante selecionado
        }
        return this.filterStudents(typeof value === 'string' ? value : '');
      })
    );

    this.subs.add(
      this.form.get('studentName')!.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        filter((value: any) => value?.trim?.() !== ''),
        switchMap(value => this.studentService.getStudentDataByFullName(value).pipe(
            catchError(err => {
                console.error('Error fetching student:', err);
                this.clearStudentInfo();
                return of(null);
            })
        ))
      ).subscribe({
          next: (datas) => {
            if (datas) {
              this.updateStudentInfo(datas);
            } else {
              this.clearStudentInfo();
            }
          },
          error: (err) => {
              console.error('Error in subscription:', err);
              this.clearStudentInfo();
          }
      })
    );

    this.subs.add(
      this.form.get('transactionType')!.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap(transactionType => this.handleTransactionTypeChange(transactionType))
      ).subscribe({
        next: (result) => {
          if (result) {
            this.studentInfo_amountMT = `${this.formatAmount(result.amount)} MT`;
          }
        },
        error: (err) => {
          console.error('Error in transaction subscription:', err);
          this.clearStudentInfo();
        }
      })
    );
  }

  private handleTransactionTypeChange(transactionType: string): Observable<{amount: number | undefined | string}> {
    switch (transactionType) {
      case 'Certificate':
        return this.amountMt$.pipe(
          map(data => ({ amount: data.find(d => d.id === "CertificateFee")?.amountMT }))
        );

      case 'Examination':
        return this.amountMt$.pipe(
          map(data => ({ amount: data.find(d => d.id === "ExamFee")?.amountMT }))
        );

      case 'Tuition':
        return of({ amount: this.paymentPayNow.currentEnrollment.amountToPay });

      default:
        return of({ amount: '--' });
    }
  }

  private filterStudents(value: string): Observable<StudentDataModel[]> {
    const filterValue = this.normalizeString(value);

    return of(this.allStudents.filter(student =>
      this.normalizeString(student.fullName).includes(filterValue) ||
      student.id.includes(filterValue)
    ));
  }

  private normalizeString(str: string): string {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private updateStudentInfo(student: StudentDataModel): void {
    const activeCourse = student.courseInfo?.find(c => c.status === 'In Progress') ?? student.courseInfo?.[0];

    this.paymentPayNow.setEnrollmentStudent({
      studentId: student.id || '--',
      fullName: student.fullName || '--',
      package: activeCourse?.package ?? '--',
      level: activeCourse?.level ?? '--',
      modality: activeCourse?.modality ?? '--',
      academicPeriod: activeCourse?.academicPeriod ?? '--',
      schedule: activeCourse?.schedule ?? '--',
      amountToPay: activeCourse?.monthlyFee ?? '--'
    });

    this.studentInfo_package = this.paymentPayNow.currentEnrollment.package;
    this.studentInfo_level = this.paymentPayNow.currentEnrollment.level;
    this.studentInfo_modality = this.paymentPayNow.currentEnrollment.modality;
    this.studentInfo_academicPeriod = this.paymentPayNow.currentEnrollment.academicPeriod;
    this.studentInfo_schedule = this.paymentPayNow.currentEnrollment.schedule;

    this.studentInfo_id = this.paymentPayNow.currentEnrollment.studentId;
    this.studentInfo_fullName = this.paymentPayNow.currentEnrollment.fullName;

    const transaction = this.form.get('transactionType')?.value;
    if (transaction == 'Tuition')
    {
      this.studentInfo_amountMT = `${this.formatAmount(this.paymentPayNow.currentEnrollment.amountToPay)} MT`;
    }
  }

  private clearStudentInfo(): void {
    this.studentInfo_id = '--';
    this.studentInfo_fullName = '--';
    this.studentInfo_package = '--';
    this.studentInfo_level = '--';
    this.studentInfo_modality = '--';
    this.studentInfo_academicPeriod = '--';
    this.studentInfo_schedule = '--';
    this.studentInfo_amountMT = '--';
    this.paymentPayNow.clear();
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

  private GetReferent(transactionType: string): string
  {
    if (transactionType == "Certificate")
    { return "Certificate" }
    else if (transactionType == "Examination")
    { return "Examination" }

    return ""
  }

  @ViewChild('studentPaymentPayNowFormRef') formElement!: ElementRef<HTMLFormElement>;
  resetForm()
  {
    this.form.reset();
    this.formElement.nativeElement.reset();
  }

  confirm() {
    if (this.form.valid) {
      this.stepperService.setActiveStep(1);

      this.paymentPayNowCreate.setEnrollmentStudent({
        studentId: this.paymentPayNow.currentEnrollment.studentId,
        receivedFrom: this.form.value.receivedFrom,
        paymentType: this.form.value.transactionType,
        description: this.GetReferent(this.form.value.transactionType),
        method: this.form.value.paymentMethod,
        amountMT: this.paymentPayNow.currentEnrollment.amountToPay
      });

      console.log("Payment = ",this.paymentPayNowCreate.currentEnrollment)
    }
  }
}
