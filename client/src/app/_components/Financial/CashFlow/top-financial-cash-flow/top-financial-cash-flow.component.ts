import { Component, OnDestroy, OnInit } from '@angular/core';
import { FinancialService } from '../../../../_services/financial.service';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-top-financial-cash-flow',
  imports: [],
  templateUrl: './top-financial-cash-flow.component.html',
  styleUrl: './top-financial-cash-flow.component.scss'
})
export class TopFinancialCashFlowComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  totalRevenue : string  = '';
  totalExpense : string  = '';
  totalBalance : string = '';

  constructor(private notificationHub: NotificationHubService, private financialService: FinancialService)
  {}

  ngOnInit(): void {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        this.loadDetails();
      })
    );
    this.loadDetails();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadDetails() {
    this.subs.add(
      this.financialService.getListRevenueCashFlowBalance().subscribe(data => {
        //console.log("Data: ", data)
        this.totalRevenue = this.formatAmount(data.totalRevenue);
        this.totalExpense = this.formatAmount(data.totalExpense);
        this.totalBalance = this.formatAmount(data.totalBalance);
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
}
