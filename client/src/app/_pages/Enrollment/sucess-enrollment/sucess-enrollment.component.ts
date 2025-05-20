import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { filter, Subscription } from 'rxjs';
import { StudentPaymentCreateDto } from '../../../_interfaces/student-payment-create-dto';
import { MatDialog } from '@angular/material/dialog';
import { DialogShareEnrollmentComponent } from '../../../_components/enrollment/dialog-share-enrollment/dialog-share-enrollment.component';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { StudentsService } from '../../../_services/students.service';
import { StudentEnrollmentFormModel } from '../../../_interfaces/student-enrollment-form-model';
import { CommonModule } from '@angular/common';
import { NotificationHubService } from '../../../_services/notification-hub.service';
import { DocumentsService } from '../../../_services/documents.service';
import { EnrollmentPaymentService } from '../../../_services/enrollment-payment.service';
import printJS from 'print-js';
import { StudentPaymentModel } from '../../../_interfaces/student-payment-model';

@Component({
  selector: 'app-sucess-enrollment',
  imports: [
    CommonModule
  ],
  templateUrl: './sucess-enrollment.component.html',
  styleUrl: './sucess-enrollment.component.scss'
})
export class SucessEnrollmentComponent implements OnInit, OnDestroy, ICellRendererAngularComp {
  private subs = new Subscription();
  //studentDetail$!: Observable<StudentEnrollmentFormModel>;
  studentData: StudentEnrollmentFormModel = {
    studentId: '',
    studentData:
    {
      order: 0,
      id: '',
      documentType: '',
      idNumber: '',
      placeOfIssue: '',
      expirationDate: '',
      fullName: '',
      dateOfBirth: '',
      dateOfBirthCalc: new Date,
      gender: '',
      maritalStatus: '',
      nationality: '',
      placeOfBirth: '',
      residentialAdress: '',
      firstPhoneNumber: '',
      secondPhoneNumber: '',
      emailAddress: '',
      additionalNotes: '',
      guardFullName: '',
      guardRelationship: '',
      guardResidentialAddress: '',
      guardFirstPhoneNumber: '',
      guardSecondPhoneNumber: '',
      guardEmailAddress: '',
      trainerName: '',
      dateUpdate: new Date,
      courseInfo: [],
      enrollmentForm: '',
      payments: []
    },
    courseName: '',
    package: '',
    level: '',
    modality: '',
    academicPeriod: '',
    schedule: '',
    duration: '',
    monthlyFee: 0,
    age: 0,
    courseFee: 0,
    installments: 0,
    days: 0,
    months: '',
    years: 0,
    times: '',
    trainerName: ''
  };

  studentDataPayment: StudentPaymentModel =
  {
    order: 0,
    id: '',
    receivedFrom: '',
    descriptionEnglish: '',
    descriptionPortuguese: '',
    method: '',
    amountMT: 0,
    inWords: '',
    status: '',
    days: 0,
    months: '',
    years: 0,
    times: '',
    dateRegister: new Date,
    studentId: '',
    studentData: '',
    trainerId: '',
    trainerName: '',
    trainer: null
  }

  amountMT : string | undefined = '--';
  receivedFrom : string | undefined = '--';
  method : string | undefined = '--';
  transaction : string | undefined = '--';

  params: any;

  constructor(private alert: SnackBarService, private dialog: MatDialog, private studentService: StudentsService, private notificationHub: NotificationHubService, private documentService: DocumentsService, private enrollmentPaymentService: EnrollmentPaymentService)
  {}

  ngOnInit(): void {
    this.subs.add(
      this.enrollmentPaymentService.enrollment$.pipe(
        filter((enrollment): enrollment is StudentPaymentCreateDto => !!enrollment)
      ).subscribe(enrollment => {
        this.amountMT = `${this.formatAmount(enrollment.amountMT)} MT`;
        this.receivedFrom = enrollment.receivedFrom;
        this.method = enrollment.method;
        this.transaction = enrollment.description;
      })
    );
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        this.loadDetails();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadDetails(): void {
    // 1. Carrega dados de matrícula (enrollment)
    this.subs.add(
      this.studentService.getStudentById().subscribe({
        next: (studentId: string) => {
          this.subs.add(
            this.studentService.detailStudentEnrollmentFormById(studentId).subscribe({
              next: (enrollmentData: StudentEnrollmentFormModel) => {
                this.studentData = { ...enrollmentData };
              },
              error: (err) => console.error('Erro ao carregar matrícula:', err)
            })
          );
        },
        error: (err) => console.error('Erro ao obter ID do aluno:', err)
      })
    );

    // 2. Carrega dados de pagamento (payment)
    this.subs.add(
      this.studentService.getStudentPaymentByLastId().subscribe({
        next: (paymentId: string) => {
          this.subs.add(
            this.studentService.detailStudentPaymentReceiptById(paymentId).subscribe({
              next: (paymentData: StudentPaymentModel) => {
                this.studentDataPayment = { ...paymentData };
              },
              error: (err) => console.error('Erro ao carregar pagamento:', err)
            })
          );
        },
        error: (err) => console.error('Erro ao obter ID do pagamento:', err)
      })
    );
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

  refresh(): boolean {
    return false;
  }

  agInit(params: any): void {
    this.params = params;
  }

  onShare()
  {
    this.dialog.open(DialogShareEnrollmentComponent)
  }

  async onExport(format: string): Promise<void>
  {
    try
    {
      switch (format)
      {
        case 'paymentReceiptPdf':
          this.generateAndDownloadPaymentReceiptPDF(this.studentDataPayment);
          break;
        case 'paymentReceiptPng':
          this.generateAndDownloadPaymentReceiptPNG(this.studentDataPayment);
          break;
        case 'PrintPaymentReceipt':
          this.generateAndDownloadPaymentReceiptPrint(this.studentDataPayment);
          break;
        case 'enrollmentFormPdf':
          this.generateAndDownloadPDF(this.studentData);
          break;
        case 'enrollmentFormPng':
          this.generateAndDownloadPNG(this.studentData);
          break;
        case 'PrintenrollmentForm':
          this.generateAndPrintEnrollmentForm(this.studentData);
          break;
        default:
          console.error('Unsupported format:', format);
      }
    } catch (error) {
      this.handleExportError(error, format);
    }
  }

  private handleExportError(error: unknown, format: string): void {
    const errorMessages = {
      copy: 'Copy to clipboard failed.',
      excel: 'Export to Excel failed.',
      pdf: 'PDF generation failed.',
      print: 'Print setup failed.'
    };

    this.alert.show(`${errorMessages}, and Format ${error}${ format}:`, 'error');
  }

  private generateAndDownloadPaymentReceiptPDF(data: StudentPaymentModel) {
    if (!data.studentId) {
      console.error('Dados do estudante estão incompletos!');
      return;
    }

    this.subs.add(
        this.documentService.PdfGeneratePaymentReceipt(data).subscribe({
        next: (response: Blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(response);
          a.download = 'ReciboDePagamento.pdf';
          a.click();
        },
        error: (err) => {
          console.error('Erro ao gerar o PDF:', err);
        },
      })
    );
  }

  private generateAndDownloadPaymentReceiptPNG(data: StudentPaymentModel) {
    if (!data.studentId) {
      console.error('Dados do estudante estão incompletos!');
      return;
    }

    this.subs.add(
        this.documentService.PngGeneratePaymentReceipt(data).subscribe({
        next: (response: Blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(response);
          a.download = 'ReciboDePagamento.png';
          a.click();
        },
        error: (err) => {
          console.error('Erro ao gerar o PNG:', err);
        },
      })
    );
  }

  private generateAndDownloadPaymentReceiptPrint(data: StudentPaymentModel) {
    if (!data.studentId) {
      console.error('Dados do estudante estão incompletos!');
      return;
    }

    this.subs.add(
        this.documentService.PdfGeneratePaymentReceipt(data).subscribe({
        next: (response: Blob) => {
          const blobUrl = URL.createObjectURL(response);

          printJS({
            printable: blobUrl,
            type: 'pdf',
            onLoadingEnd: () => {
            URL.revokeObjectURL(blobUrl); // Limpeza de memória
          },
          onError: () => {
            // console.error('PrintJS error:', error);
            this.alert.show('Oops! Direct printing failed.', 'error');
            }
          });
        },
        error: (err) => {
          console.error('Erro ao gerar o PNG:', err);
        },
      })
    );
  }

  private generateAndDownloadPDF(data: StudentEnrollmentFormModel) {
    if (!data.studentId) {
      console.error('Dados do estudante estão incompletos!');
      return;
    }

    this.subs.add(
        this.documentService.PdfGenerateEnrollmentForm(data).subscribe({
        next: (response: Blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(response);
          a.download = 'FichaDeInscricao.pdf';
          a.click();
        },
        error: (err) => {
          console.error('Erro ao gerar o PDF:', err);
        },
      })
    );
  }

  private generateAndDownloadPNG(data: StudentEnrollmentFormModel) {
    if (!data.studentId) {
      console.error('Dados do estudante estão incompletos!');
      return;
    }

    this.subs.add(
        this.documentService.PngGenerateEnrollmentForm(data).subscribe({
        next: (response: Blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(response);
          a.download = 'FichaDeInscricao.png';
          a.click();
        },
        error: (err) => {
          console.error('Erro ao gerar o PNG:', err);
        },
      })
    );
  }

  private generateAndPrintEnrollmentForm(data: StudentEnrollmentFormModel) {
    if (!data.studentId) {
      console.error('Dados do estudante estão incompletos!');
      return;
    }

    this.subs.add(
        this.documentService.PdfGenerateEnrollmentForm(data).subscribe({
        next: (response: Blob) => {
          const blobUrl = URL.createObjectURL(response);

          printJS({
            printable: blobUrl,
            type: 'pdf',
            onLoadingEnd: () => {
            URL.revokeObjectURL(blobUrl); // Limpeza de memória
          },
          onError: () => {
            // console.error('PrintJS error:', error);
            this.alert.show('Oops! Direct printing failed.', 'error');
            }
          });
        },
        error: (err) => {
          console.error('Erro ao gerar o PNG:', err);
        },
      })
    );
  }
}
