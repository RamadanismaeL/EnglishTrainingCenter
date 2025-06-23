import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ExpenseFinancialDailyReportComponent } from '../expense-financial-daily-report/expense-financial-daily-report.component';
import { RevenueFinancialDailyReportComponent } from '../revenue-financial-daily-report/revenue-financial-daily-report.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { FinancialService } from '../../../../_services/financial.service';

export interface DetailsTable {
  method: string
  revenue: string
  expense: string
  finalBalance: string
}

@Component({
  selector: 'app-transactions-financial-daily-report',
  imports: [
    MatTabsModule,
    ExpenseFinancialDailyReportComponent,
    RevenueFinancialDailyReportComponent,
    CommonModule,
    MatTableModule
  ],
  templateUrl: './transactions-financial-daily-report.component.html',
  styleUrl: './transactions-financial-daily-report.component.scss'
})
export class TransactionsFinancialDailyReportComponent implements OnInit, OnDestroy {
  private subs = new Subscription();

  displayedColumns: string[] = ['method', 'revenue', 'expense', 'finalBalance'];
  dataSource : DetailsTable[] = [];

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
      this.financialService.getListDailyReportTransaction().subscribe(data => {
        this.dataSource = [
          {
            method: 'Bank',
            revenue: this.formatAmount(data.bankRevenue),
            expense: this.formatAmount(data.bankExpense),
            finalBalance: this.formatAmount(data.bankFinalBalance)
          },
          {
            method: 'Cash',
            revenue: this.formatAmount(data.cashRevenue),
            expense: this.formatAmount(data.cashExpense),
            finalBalance: this.formatAmount(data.cashFinalBalance)
          },
          {
            method: 'E-Mola',
            revenue: this.formatAmount(data.eMolaRevenue),
            expense: this.formatAmount(data.eMolaExpense),
            finalBalance: this.formatAmount(data.eMolaFinalBalance)
          },
          {
            method: 'M-Pesa',
            revenue: this.formatAmount(data.mPesaRevenue),
            expense: this.formatAmount(data.mPesaExpense),
            finalBalance: this.formatAmount(data.mPesaFinalBalance)
          },
          {
            method: 'Total',
            revenue: this.formatAmount(data.totalRevenue),
            expense: this.formatAmount(data.totalExpense),
            finalBalance: this.formatAmount(data.totalFinalBalance)
          }
        ];

        //console.log("Data = ",data.totalRevenue)
        //console.log("Table = ",this.dataSource)
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
