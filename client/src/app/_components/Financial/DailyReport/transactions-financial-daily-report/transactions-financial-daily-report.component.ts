import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ExpenseFinancialDailyReportComponent } from '../expense-financial-daily-report/expense-financial-daily-report.component';
import { RevenueFinancialDailyReportComponent } from '../revenue-financial-daily-report/revenue-financial-daily-report.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';


export interface DetailsTable {
  method: string | undefined;
  revenue: string | undefined;
  expense: string | undefined;
  finalBalance: string | undefined;
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
export class TransactionsFinancialDailyReportComponent {
  displayedColumns: string[] = ['method', 'revenue', 'expense', 'finalBalance'];

  dataSource : DetailsTable[] =
  [
    {method: 'Bank', revenue: '0,00', expense: '0,00', finalBalance: '0,00'},
    {method: 'Cash', revenue: '0,00', expense: '0,00', finalBalance: '0,00'},
    {method: 'E-Mola', revenue: '0,00', expense: '0,00', finalBalance: '0,00'},
    {method: 'M-Pesa', revenue: '0,00', expense: '0,00', finalBalance: '0,00'},
    {method: 'Total', revenue: '0,00', expense: '0,00', finalBalance: '0,00'},
  ]
}
