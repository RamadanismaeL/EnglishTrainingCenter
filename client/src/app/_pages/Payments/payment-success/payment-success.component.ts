import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { filter, Subscription } from 'rxjs';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogSharePaymentComponent } from '../../../_components/payment/dialog-share-payment/dialog-share-payment.component';
import { PaymentPayNowCreateService } from '../../../_services/payment-pay-now-create.service';
import { StudentPaymentCreateDto } from '../../../_interfaces/student-payment-create-dto';

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

  constructor(private paymentPayNowCreate: PaymentPayNowCreateService)
  {}

  ngOnInit(): void {
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
}
