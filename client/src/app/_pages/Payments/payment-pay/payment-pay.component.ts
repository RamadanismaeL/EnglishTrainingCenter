import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, filter, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { NotificationHubService } from '../../../_services/notification-hub.service';
import { StepperPaymentService } from '../../../_services/stepper-payment.service';
import { StudentDataModel } from '../../../_interfaces/student-data-model';
import { StudentsService } from '../../../_services/students.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';

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

  studentInfo_id : string | undefined = '--';
  studentInfo_fullName : string | undefined = '--';
  studentInfo_package : string | undefined = '--';
  studentInfo_level : string | undefined = '--';
  studentInfo_modality : string | undefined = '--';
  studentInfo_academicPeriod : string | undefined = '--';
  studentInfo_schedule : string | undefined = '--';
  studentInfo_amountMT : string | undefined = '--';

  private subs = new Subscription();

  constructor(private alert: SnackBarService,private notificationHub: NotificationHubService, private stepperService: StepperPaymentService, private studentService: StudentsService)
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
        filter(value => value !== null && value !== ''),
        switchMap(value => this.studentService.getStudentDataByFullName(value))
      ).subscribe(datas => {
        if (datas && typeof datas === 'object') {
          this.updateStudentInfo(datas);
        } else {
          this.clearStudentInfo();
        }
      })
    );
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
    this.studentInfo_id = student.id || '--';
    this.studentInfo_fullName = student.fullName || '--';
    /*
    this.studentInfo_package = student.courseInfo.package || '--';
    this.studentInfo_level = student.courseInfo.level || '--';
    this.studentInfo_modality = student.courseInfo.modality || '--';
    this.studentInfo_academicPeriod = student.courseInfo.academicPeriod || '--';
    this.studentInfo_schedule = student.courseInfo.schedule || '--';
    //this.studentInfo_amountMT = student.courseInfo.am ? `MT ${student.amountMT}` : '--';
    */
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
