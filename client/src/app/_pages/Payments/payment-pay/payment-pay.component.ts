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
import { AsyncPipe, CommonModule } from '@angular/common';
import { SettingAmountMtDetailsDto } from '../../../_interfaces/setting-amount-mt-details-dto';
import { SettingService } from '../../../_services/setting.service';
import { PaymentPayNowService } from '../../../_services/payment-pay-now.service';
import { PaymentPayNowCreateService } from '../../../_services/payment-pay-now-create.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackBarService } from '../../../_services/snack-bar.service';

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
    AsyncPipe,
    CommonModule
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
  amountMToPay : number | undefined;

  previousAmountValue: string = '';
  courseFeeActive: boolean = false;
  courseFeeId: string | undefined | null;
  description: string = '';

  private subs = new Subscription();

  constructor(private notificationHub: NotificationHubService, private stepperService: StepperPaymentService, private studentService: StudentsService, private settingService: SettingService, private paymentPayNow: PaymentPayNowService, private paymentPayNowCreate: PaymentPayNowCreateService, private alert: SnackBarService)
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
      debounceTime(200),
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

    if (this.form.get('transactionType')?.value == "CourseFee")
    { this.courseFeeActive = true; }
    else
    { this.courseFeeActive = false; }

    this.subs.add(
      this.form.get('courseFee')?.valueChanges
      .pipe(
        debounceTime(50), // Espera 300ms após a digitação
        distinctUntilChanged() // Só emite se o valor mudou
      )
      .subscribe(value => {
        //console.log("Hello Data = ",value)
        if(this.courseFeeActive == true)
        {
          if (value == 0 || value == null)
          { this.studentInfo_amountMT = "--" }
          else
          {
            this.studentInfo_amountMT = `${this.formatAmount(value)} MT`;
          }
          this.paymentPayNow.updateAttribute('amountToPay', value)
          this.amountMToPay = value;
        }
      })
    );

    this.subs.add(
      this.form.get('transactionType')!.valueChanges.pipe(
        debounceTime(50),
        distinctUntilChanged(),
        switchMap(transactionType => {
          return this.handleTransactionTypeChange(transactionType)
        })
      ).subscribe({
        next: (result) => {
          //console.warn("CourseFee = ",this.courseFeeActive)
          this.updateCourseFeeValidation();
          if (result.amount == 0 || result.amount == null)
          { this.studentInfo_amountMT = "--" }

          if(this.courseFeeActive == false)
          {
            this.studentInfo_amountMT = `${this.formatAmount(result.amount)} MT`;

            this.paymentPayNow.updateAttribute('amountToPay', result.amount);
            this.amountMToPay = result.amount;
          }
        },
        error: (err) => {
          console.error('Error in transaction subscription:', err);
          this.clearStudentInfo();
        }
      })
    );
  }

  private handleTransactionTypeChange(transactionType: string): Observable<{amount: number | undefined }> {
    switch (transactionType) {
      case 'Certificate':
        this.courseFeeActive = false;
        return this.amountMt$.pipe(
          map(data => ({ amount: data.find(d => d.id === "CertificateFee")?.amountMT }))
        );

      case 'Examination':
        this.courseFeeActive = false;
        return this.amountMt$.pipe(
          map(data => ({ amount: data.find(d => d.id === "ExamFee")?.amountMT }))
        );

      case 'CourseFee':
        this.courseFeeActive = true;
        return of({ amount: 0 });

      default:
        return of({ amount: 0 });
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
      courseFeeId: student.studentCourseFee.id || '--',
      package: activeCourse?.package ?? '--',
      level: activeCourse?.level ?? '--',
      modality: activeCourse?.modality ?? '--',
      academicPeriod: activeCourse?.academicPeriod ?? '--',
      schedule: activeCourse?.schedule ?? '--',
      amountToPay: this.amountMToPay
    });

    this.studentInfo_package = this.paymentPayNow.currentEnrollment.package;
    this.studentInfo_level = this.paymentPayNow.currentEnrollment.level;
    this.studentInfo_modality = this.paymentPayNow.currentEnrollment.modality;
    this.studentInfo_academicPeriod = this.paymentPayNow.currentEnrollment.academicPeriod;
    this.studentInfo_schedule = this.paymentPayNow.currentEnrollment.schedule;

    this.studentInfo_id = this.paymentPayNow.currentEnrollment.studentId;
    this.studentInfo_fullName = this.paymentPayNow.currentEnrollment.fullName;
  }

  public clearStudentInfo(): void {
    this.courseFeeActive = false;
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
      courseFee : [''],
      paymentMethod : ['', [Validators.required, Validators.nullValidator]]
    });
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  updateCourseFeeValidation() {
    const courseFeeControl = this.form.get('courseFee');

    if (this.courseFeeActive) {
      // Add validators when active
      courseFeeControl?.setValidators([Validators.required, Validators.nullValidator]);
      courseFeeControl?.enable(); // Ensure control is enabled
    } else {
      // Remove validators when inactive
      courseFeeControl?.clearValidators();
      courseFeeControl?.disable(); // Disable the control
      courseFeeControl?.setValue(null); // Clear the value
      courseFeeControl?.updateValueAndValidity(); // Update validation state
    }

    this.form.updateValueAndValidity(); // Update the entire form's validity
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
    else if (transactionType == "CourseFee")
    { return "Course Fee" }

    return ""
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

  @ViewChild('studentPaymentPayNowFormRef') formElement!: ElementRef<HTMLFormElement>;
  resetForm()
  {
    this.form.reset();
    this.formElement.nativeElement.reset();
  }

  confirm() {
    if (this.form.valid) {
      this.description = this.GetReferent(this.form.value.transactionType);
      if (this.description == "Course Fee")
      { this.courseFeeId = this.paymentPayNow.currentEnrollment.courseFeeId; }
      else
      { this.courseFeeId = null; }

      this.paymentPayNowCreate.setEnrollmentStudent({
        studentId: this.paymentPayNow.currentEnrollment.studentId,
        courseFeeId: this.courseFeeId,
        receivedFrom: this.capitalizeWords(this.form.value.receivedFrom),
        description: this.description,
        method: this.form.value.paymentMethod,
        amountMT: this.paymentPayNow.currentEnrollment.amountToPay
      });

      //console.log("Payment = ",this.paymentPayNowCreate.currentEnrollment)
      if (this.courseFeeId != null)
      {
        this.studentService.getPriceDueById(this.courseFeeId).subscribe(priceDue => {
          if (priceDue == 0)
          {
            this.alert.show('The payment was not processed, as this fee has already been settled by the student.', 'error');
          }
          else
          {
            this.subs.add(
              this.studentService.createStudentPayment(this.paymentPayNowCreate.currentEnrollment)
              .subscribe({
                next: () => {
                  this.paymentPayNow.clear();
                  this.alert.show('Registration completed successfully!', 'success');
                  this.notificationHub.sendMessage("Initialize enrollment form.");
                  this.stepperService.setActiveStep(1);
                },
                error: (error) => {
                  console.error("Erro no processo:", error);
                  this.handleError(error);
                }
              })
            );
          }
        });
      }
      else
      {
        this.subs.add(
          this.studentService.createStudentPayment(this.paymentPayNowCreate.currentEnrollment)
          .subscribe({
            next: () => {
              this.paymentPayNow.clear();
              this.alert.show('Registration completed successfully!', 'success');
              this.notificationHub.sendMessage("Initialize enrollment form.");
              this.stepperService.setActiveStep(1);
            },
            error: (error) => {
              console.error("Erro no processo:", error);
              this.handleError(error);
            }
          })
        );
      }
    }
  }

  onAmount(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/[^\d]/g, '');

    const numberValue = this.parseNumber(value);

    // Validação de limite
    if (numberValue > 10000000) {
      input.value = this.previousAmountValue || '';
      return;
    }

    input.value = this.formatNumber(value);
    this.previousAmountValue = input.value;
  }

  formatNumber(value: string): string {
    if (value.endsWith(',')) {
      let integerPart = value.replace(',', '').replace(/\D/g, '');
      integerPart = integerPart.replace(/^0+/, '') || '0';
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return integerPart + ',';
    }

    let [integerPart, decimalPart] = value.split(',');

    integerPart = integerPart.replace(/\D/g, '');
    integerPart = integerPart.replace(/^0+/, '') || '0';
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (decimalPart !== undefined) {
      decimalPart = decimalPart.replace(/\D/g, '').substring(0, 2);
      return integerPart + ',' + decimalPart;
    }

    return integerPart;
  }

  parseNumber(formattedValue: string): number {
    const numberString = formattedValue.replace(/\./g, '').replace(',', '.');
    return parseFloat(numberString) || 0;
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
