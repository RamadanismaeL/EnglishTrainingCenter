import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, RowSelectionOptions } from 'ag-grid-community';
import { Observable, Subscription, switchMap } from 'rxjs';
import { NotificationHubService } from '../../_services/notification-hub.service';
import { SettingAcademicYearDetailDto } from '../../_interfaces/setting-academic-year-detail-dto';
import { SettingService } from '../../_services/setting.service';
import { SnackBarService } from '../../_services/snack-bar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SettingAmountMtDetailsDto } from '../../_interfaces/setting-amount-mt-details-dto';
import { BtnActionSettingsWeeklyScheduleTableComponent } from './btn-action-settings-weekly-schedule-table/btn-action-settings-weekly-schedule-table.component';

export interface MonthlyTuition {
  id: string,
  intensive: number | undefined,
  private: number | undefined,
  regular: number | undefined,
}

export interface WeeklySchedule {
  monday: string | undefined;
  tuesday: string | undefined;
  wednesday: string | undefined;
  thursday: string | undefined;
}

@Component({
  selector: 'app-settings',
  imports: [
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    MatTableModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit, OnDestroy
{
  // Academic Year
  private academicYear$!: Observable<SettingAcademicYearDetailDto[]>;

  startMonth: string | undefined = '';
  startDay: number | undefined = 0;
  startYear: number | undefined = 0;
  endMonth: string | undefined = '';
  endDay: number | undefined = 0;
  endYear: number | undefined = 0;

  // AmountMt
  private amountMt$!: Observable<SettingAmountMtDetailsDto[]>;

  certificateFee: string | undefined = '';
  enrollmentFee: string | undefined = '';
  examFee: string | undefined = '';
  courseFee: string | undefined = '';
  installment: string | undefined = '';

  /* ............... end ............... */

  private readonly fb = inject(FormBuilder);
  formAcademicYear! : FormGroup;
  formCurrentFees! : FormGroup;
  formMonthlyTuition! : FormGroup;
  formSchedule! : FormGroup;

  editAcademicYear : boolean = false;
  editCurrentFees : boolean = false;
  editMonthlyTuition : boolean = false;
  editWeeklySchedule : boolean = false;

  displayedColumnsWeeklySchedule: string[] = ['monday', 'tuesday', 'wednesday', 'thursday'];
  weeklySchedule: WeeklySchedule[] = [];

  previousAmountValue: string = '';

  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  months: string[] =
  [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = Array.from({ length: 6 }, (_, i) => i + 2025);

  // Monthly Tuition
  displayedColumns: string[] = ['id', 'intensive', 'private', 'regular'];
  dataSourceMonthly : MonthlyTuition[] = [];

  @ViewChild('agGridInPerson') agGridInPerson: any;
  @ViewChild('agGridOnline') agGridOnline: any;

  // Arrays de Dados
  rowDataMonthly: MonthlyTuition[] = []; // Dados carregados do backend

  // Dados filtrados para visualização
  rowDataMonthlyInPerson: MonthlyTuition[] = [];
  rowDataMonthlyOnline: MonthlyTuition[] = [];

   // Array para controle de alterações
  modifiedRows: MonthlyTuition[] = [];

  colDefsMonthlyTuition: ColDef[] =
    [
      {
        headerName: 'Level',
        field: 'id', flex: 1,
        cellClass: 'custom-cell-center',
        editable: false,
        valueFormatter: (params) => this.convertLevel(params.value)
      },
      {
        headerName: 'Intensive (MT)',
        field: 'intensive', flex: 1,
        cellClass: 'custom-cell-center',
        editable: true
      },
      {
        headerName: 'Private (MT)',
        field: 'private', flex: 1,
        cellClass: 'custom-cell-center',
        editable: true
      },
      {
        headerName: 'Regular (MT)',
        field: 'regular', flex: 1,
        cellClass: 'custom-cell-center',
        editable: true
      }
    ];

  // Configuração dos Grids
  gridOptionsInPerson: GridOptions = {
    defaultColDef: {
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
    },
    onCellValueChanged: (event) => {
      this.addToModified(event.data);
    },
  };

  gridOptionsOnline: GridOptions = {
    defaultColDef: {
      editable: true,
      sortable: true,
      filter: true,
      resizable: true,
    },
    onCellValueChanged: (event) => {
      this.addToModified(event.data);
    },
  };

  schedules: string[] =
  [
    'Grammar', 'Listening', 'Reading', 'Speaking', 'Writing'
  ];

  // Weekly Schedule
  columnDefsAction: ColDef[] =
    [
      {
        headerName: 'Monday',
        field: 'monday', flex: 1,
        cellClass: 'custom-cell-center'
      },
      {
        headerName: 'Tuesday',
        field: 'tuesday', flex: 1,
        cellClass: 'custom-cell-center'
      },
      {
        headerName: 'Wednesday',
        field: 'wednesday', flex: 1,
        cellClass: 'custom-cell-center'
      },
      {
        headerName: 'Thursday',
        field: 'thursday', flex: 1,
        cellClass: 'custom-cell-center'
      },
      {
        field: 'Action',
        headerName: 'Action', maxWidth: 110, flex: 1,
        cellRenderer: BtnActionSettingsWeeklyScheduleTableComponent,
        cellClass: 'custom-cell-center'
      }
    ];

  rowData: any[] = [];

  rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "singleRow",
    checkboxes: false,
    enableClickSelection: true
  };

  private subs = new Subscription();

  constructor (private notificationHub: NotificationHubService, private settingService: SettingService, private alert: SnackBarService)
  {}

  ngOnInit()
  {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        this.loadDetails();
      })
    );

    this.initializeForm();
    this.loadDetails();
    this.editAcademicYear = !this.editAcademicYear;
    this.editCurrentFees = !this.editCurrentFees;
    this.editMonthlyTuition = !this.editMonthlyTuition;
    this.editWeeklySchedule = !this.editWeeklySchedule;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private initializeForm() : void {
    this.formAcademicYear = this.fb.group({
      startDateMonth : ['', [Validators.required, Validators.nullValidator]],
      startDateDay : ['', [Validators.required, Validators.nullValidator]],
      startDateYear : ['', [Validators.required, Validators.nullValidator]],
      endDateMonth : ['', [Validators.required, Validators.nullValidator]],
      endDateDay : ['', [Validators.required, Validators.nullValidator]],
      endDateYear : ['', [Validators.required, Validators.nullValidator]]
    });

    this.formCurrentFees = this.fb.group({
      certificateFee : ['', [Validators.required, Validators.nullValidator]],
      enrollmentFee : ['', [Validators.required, Validators.nullValidator]],
      examFee : ['', [Validators.required, Validators.nullValidator]],
      courseFee : ['', [Validators.required, Validators.nullValidator]],
      installment : ['', [Validators.required, Validators.nullValidator]]
    });

    this.formSchedule = this.fb.group({
      monday : ['', [Validators.required, Validators.nullValidator]],
      tuesday : ['', [Validators.required, Validators.nullValidator]],
      wednesday : ['', [Validators.required, Validators.nullValidator]],
      thursday : ['', [Validators.required, Validators.nullValidator]]
    });
  }

  loadDetails()
  {
    // Academic Year
    this.academicYear$ = this.settingService.detailsAcademicYear();

    this.subs.add(
      this.academicYear$.subscribe(data => {
        const start = data.find(d => d.id === 1);
        const end = data.find(d => d.id === 2);
        this.startDay = start?.day;
        this.startMonth = start?.month;
        this.startYear = start?.year;
        this.endDay = end?.day;
        this.endMonth = end?.month;
        this.endYear = end?.year;
      })
    );

    // AmountMt
    this.amountMt$ = this.settingService.detailsAmountMt();

    this.subs.add(
      this.amountMt$.subscribe(data => {
        const cert = data.find(d => d.id === 'CertificateFee');
        const enr = data.find(d => d.id === 'EnrollmentFee');
        const exam = data.find(d => d.id === 'ExamFee');
        const course = data.find(d => d.id === 'CourseFee');
        const installment = data.find(d => d.id === 'Installments');

        this.certificateFee = this.formatAmount(cert?.amountMT);
        this.enrollmentFee = this.formatAmount(enr?.amountMT);
        this.examFee = this.formatAmount(exam?.amountMT);
        this.courseFee = this.formatAmount(course?.amountMT);
        this.installment = this.formatAmount(installment?.amountMT);
      })
    );

    // Monthly Tuition
    this.subs.add(
      this.settingService.detailsMonthly().subscribe(data => {
        this.rowDataMonthly = data;

        this.rowDataMonthlyInPerson = data.filter((item) => item.id.includes('In-Person'));
        this.rowDataMonthlyOnline = data.filter((item) => item.id.includes('Online'));
      })
    );

    // Weekly Schedule
    this.subs.add(
      this.settingService.detailsWeeklySchedule().subscribe((data: any) => {
        this.rowData = data;
        this.weeklySchedule = data;
      })
    );
  }

  // ✅ Método para adicionar na lista de modificados
  addToModified(row: MonthlyTuition) {
    const index = this.modifiedRows.findIndex(item => item.id === row.id);
    if (index >= 0) {
      this.modifiedRows[index] = row; // Atualiza se já existir
    } else {
      this.modifiedRows.push(row); // Adiciona se for novo
    }
  }

  getErrorFormsAcademicYear(controlName: string)
  {
    return this.formAcademicYear.get(controlName);
  }

  getErrorFormsCurrentFees(controlName: string)
  {
    return this.formCurrentFees.get(controlName);
  }

  getErrorFormsMonthlyTuition(controlName: string)
  {
    return this.formMonthlyTuition.get(controlName);
  }

  getErrorFormsWeeklySchedule(controlName: string)
  {
    return this.formSchedule.get(controlName);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 400) {
      this.alert.show('An error occurred while updating.', 'error');
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

  // ACADEMIC YEAR
  onCancelAcademicYear ()
  {
    this.editAcademicYear = !this.editAcademicYear;
  }

  onEditAcademicYear ()
  {
    this.editAcademicYear = !this.editAcademicYear;

    this.formAcademicYear.patchValue({
      startDateMonth: this.startMonth,
      startDateDay: this.startDay,
      startDateYear: this.startYear,
      endDateMonth: this.endMonth,
      endDateDay: this.endDay,
      endDateYear: this.endYear
    });
  }

  onSaveAcademicYear ()
  {
    if (this.formAcademicYear.valid) {
      const startDateData = {
        id: 1,
        day: this.formAcademicYear.value.startDateDay,
        month: this.formAcademicYear.value.startDateMonth,
        year: this.formAcademicYear.value.startDateYear
      };

      const endDateData = {
        id: 2,
        day: this.formAcademicYear.value.endDateDay,
        month: this.formAcademicYear.value.endDateMonth,
        year: this.formAcademicYear.value.endDateYear
      };

      this.subs.add(
        this.settingService.updateAcademicYear(startDateData).pipe(
          switchMap(() => this.settingService.updateAcademicYear(endDateData))
        ).subscribe({
          next: () => {
            this.editAcademicYear = !this.editAcademicYear;
            this.alert.show('Academic Year updated successfully!', 'success')
          },
          error: (error: HttpErrorResponse) => this.handleError(error)
        })
      )
    }
  }

  // CURRENT FEES
  onCancelCurrentFees ()
  {
    this.editCurrentFees = !this.editCurrentFees;
  }

  onEditCurrentFees ()
  {
    this.editCurrentFees = !this.editCurrentFees;

    this.formCurrentFees.patchValue({
      certificateFee : this.certificateFee,
      enrollmentFee : this.enrollmentFee,
      examFee : this.examFee,
      courseFee : this.courseFee,
      installment : this.installment
    });
  }

  onSaveCurrentFees ()
  {
    if (this.formCurrentFees.valid)
    {
      const newCertificateFee = {
        id: "CertificateFee",
        amountMT: this.parseNumber(this.formCurrentFees.value.certificateFee)
      };

      const newEnrollmentFee = {
        id: "EnrollmentFee",
        amountMT: this.parseNumber(this.formCurrentFees.value.enrollmentFee)
      };

      const newExamFee = {
        id: "ExamFee",
        amountMT: this.parseNumber(this.formCurrentFees.value.examFee)
      };

      const newCourseFee = {
        id: "CourseFee",
        amountMT: this.parseNumber(this.formCurrentFees.value.courseFee)
      };

      const newInstallment = {
        id: "Installments",
        amountMT: this.parseNumber(this.formCurrentFees.value.installment)
      };

      this.subs.add(
        this.settingService.updateAmountMt(newCertificateFee).pipe(
          switchMap(() => this.settingService.updateAmountMt(newEnrollmentFee)),
          switchMap(() => this.settingService.updateAmountMt(newExamFee)),
          switchMap(() => this.settingService.updateAmountMt(newCourseFee)),
          switchMap(() => this.settingService.updateAmountMt(newInstallment))
        ).subscribe({
          next: () => {
            this.editCurrentFees = !this.editCurrentFees;
            this.alert.show('Current fees updated successfully!', 'success')
          },
          error: (error: HttpErrorResponse) => this.handleError(error)
        })
      )
    }
  }

  // MONTH0LY TUITION
  onCancelMonthlyTuition ()
  {
    this.editMonthlyTuition = !this.editMonthlyTuition;
  }

  onEditMonthlyTuition ()
  {
    this.editMonthlyTuition = !this.editMonthlyTuition;
  }

  onSaveMonthlyTuition() {
    if (this.modifiedRows.length === 0) {
      this.alert.show('No changes to save!', 'warning');
      return;
    }

    //console.log('Alterações para salvar:', this.modifiedRows);

    // 🔥 Enviar todas as alterações para o backend
    this.subs.add(
      this.modifiedRows.forEach((tuition) => {
        this.settingService.updateMonthly(tuition).subscribe({
          next: () => {
            this.alert.show('Monthly Tuition updated successfully!!', 'success');
          },
          error: (error) => {
            console.error('Error:', error);
            this.alert.show('An error occurred while updating.', 'error');
          },
        });
      })
    )

    // 🔥 Limpa a lista após salvar
    this.modifiedRows = [];
    this.editMonthlyTuition = !this.editMonthlyTuition;
  }

  convertLevel(value: string | undefined): string {
    if (value === 'A1-In-Person' || value === 'A1-Online') return 'A1'
    if (value === 'A2-In-Person' || value === 'A2-Online') return 'A2'
    if (value === 'B1-In-Person' || value === 'B1-Online') return 'B1'
    if (value === 'B2-In-Person' || value === 'B2-Online') return 'B2'
    if (value === 'C1-In-Person' || value === 'C1-Online') return 'C1'
    if (value === 'C2-In-Person' || value === 'C2-Online') return 'C2'

    return ''
  }

  // AmountMt Label return 0,00
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

  onAmount(event: any) {
    const input = event.target;
    let value = input.value;

    // Permite dígitos e vírgula (mas não permite vírgula no início sozinha)
    const numericValue = value.replace(/[^\d,]/g, '');

    // Se for apenas uma vírgula, não faz nada (aguarda dígitos)
    if (numericValue === ',') {
      return;
    }

    // Se após limpeza estiver vazio, define como vazio
    if (numericValue === '') {
      input.value = '';
      return;
    }

    // Converte para número e verifica o valor máximo
    const numberValue = this.parseNumber(numericValue);
    if (numberValue > 10000000000) {
      input.value = this.previousAmountValue || '';
    } else {
      input.value = this.formatNumber(numericValue);
      this.previousAmountValue = input.value;
    }
  }

  formatNumber(value: string): string {
      // Caso especial: quando o usuário está digitando um decimal (ex: "0," ou "123,")
      if (value.endsWith(',')) {
          let integerPart = value.replace(/\D/g, '');
          integerPart = integerPart.replace(/^0+/, '') || '0';
          integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          return integerPart + ',';
      }

      // Processamento normal para valores completos
      let [integerPart, decimalPart] = value.split(',');

      // Limpa parte inteira
      integerPart = integerPart.replace(/\D/g, '');
      integerPart = integerPart.replace(/^0+/, '') || '0';
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      // Processa parte decimal (se existir)
      if (decimalPart !== undefined) {
          decimalPart = decimalPart.replace(/\D/g, '').substring(0, 2);
          return integerPart + ',' + decimalPart;
      }

      return integerPart;
  }

  parseNumber(formattedValue: string): number {
      // Converte "1.234,56" para 1234.56
      const numberString = formattedValue.replace(/\./g, '').replace(',', '.');
      return parseFloat(numberString) || 0;
  }


  // WEEKLY SCHEDULE
  @ViewChild('weeklyScheduleFormRef') formElement!: ElementRef<HTMLFormElement>;

  onCancelWeeklySchedule ()
  {
    this.editWeeklySchedule = !this.editWeeklySchedule;
  }

  onEditWeeklySchedule ()
  {
    this.editWeeklySchedule = !this.editWeeklySchedule;
  }

  onSaveWeeklySchedule ()
  {
    if (this.formSchedule.valid)
    {}
  }

  onNewWeeklySchedule ()
  {
    if (this.formSchedule.valid)
    {
      this.subs.add(
        this.settingService.createWeeklySchedule(this.formSchedule.value).subscribe({
          next: () => {
            this.formSchedule.reset();
            this.formElement.nativeElement.reset();
            this.alert.show('Weekly schedule created successfully!', 'success')
          },
          error: (error: HttpErrorResponse) => this.handleError(error)
        })
      )
    }
  }
}
