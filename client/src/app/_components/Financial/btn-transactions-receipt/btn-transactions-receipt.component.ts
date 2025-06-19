import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { FormControl } from '@angular/forms';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { DocumentsService } from '../../../_services/documents.service';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { StudentsService } from '../../../_services/students.service';
import { Subscription } from 'rxjs';
import printJS from 'print-js';
import { StudentPaymentModel } from '../../../_interfaces/student-payment-model';

@Component({
  selector: 'app-btn-transactions-receipt',
  imports: [
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './btn-transactions-receipt.component.html',
  styleUrl: './btn-transactions-receipt.component.scss'
})
export class BtnTransactionsReceiptComponent implements ICellRendererAngularComp, OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  positionL = new FormControl(this.positionOptions[2]);

  params: any;
  private subs = new Subscription();

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

  constructor (private studentService: StudentsService, private documentService: DocumentsService, private alert: SnackBarService)
  {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  test () {
    console.log(`Payment ID = ${this.params.data.paymentId}`)
  }

  ngOnInit(): void {
    this.subs.add(
      this.studentService.detailStudentPaymentReceiptById(this.params.data.paymentId).subscribe({
        next: (paymentData: StudentPaymentModel) => {
          this.studentDataPayment = { ...paymentData };
        },
        error: (err) => console.error('Erro ao carregar pagamento:', err)
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
        this.alert.show('Receipt not available.', 'warning');
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
        this.alert.show('Receipt not available.', 'warning');
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
        this.alert.show('Receipt not available.', 'warning');
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
