import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { filter, Subscription } from 'rxjs';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogSharePaymentComponent } from '../../../_components/payment/dialog-share-payment/dialog-share-payment.component';
import { PaymentPayNowCreateService } from '../../../_services/payment-pay-now-create.service';
import { StudentPaymentCreateDto } from '../../../_interfaces/student-payment-create-dto';
import { StudentPaymentModel } from '../../../_interfaces/student-payment-model';
import { StudentsService } from '../../../_services/students.service';
import { DocumentsService } from '../../../_services/documents.service';
import printJS from 'print-js';
import { NotificationHubService } from '../../../_services/notification-hub.service';

@Component({
  selector: 'app-payment-success',
  imports: [],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss'
})
export class PaymentSuccessComponent implements OnInit, OnDestroy, ICellRendererAngularComp {
  private subs = new Subscription();
  amountMT : string | undefined = '--';
  method : string | undefined = '--';
  transaction : string | undefined = '--';
  receivedFrom : string | undefined = '--';

  params: any;

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

  constructor(private paymentPayNowCreate: PaymentPayNowCreateService, private studentService: StudentsService, private documentService: DocumentsService, private alert: SnackBarService, private notificationHub: NotificationHubService)
  {}

  ngOnInit(): void {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
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
      })
    );

    this.subs.add(
      this.paymentPayNowCreate.enrollment$.pipe(
        filter((enrollment): enrollment is StudentPaymentCreateDto => !!enrollment)
      ).subscribe(enrollment => {
        this.amountMT = `${this.formatAmount(enrollment.amountMT)} MT`;
        this.receivedFrom = enrollment.receivedFrom;
        this.method = enrollment.method;
        this.transaction = enrollment.description;
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
    //this.dialog.open(DialogSharePaymentComponent)
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
}
