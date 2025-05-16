import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogSharePaymentComponent } from '../../../_components/payment/dialog-share-payment/dialog-share-payment.component';

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
  transactionType : string | undefined = '--';
  receivedFrom : string | undefined = '--';

  params: any;

  constructor(private alert: SnackBarService, private dialog: MatDialog)
  {}

  ngOnInit(): void {
    /*
      this.subs.add(
        this.enrollmentPaymentService.enrollment$.pipe(
          filter((enrollment): enrollment is StudentPaymentCreateDto => !!enrollment)
        ).subscribe(enrollment => {
          this.amountMT = `${this.formatAmount(enrollment.amountMT)} MT`;
          this.receivedFrom = enrollment.receivedFrom;
          this.method = enrollment.method;
        })
      );
      */
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
      this.dialog.open(DialogSharePaymentComponent)
    }
}
