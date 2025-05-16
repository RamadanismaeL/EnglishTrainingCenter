import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ExpenseFinancialCashFlowComponent } from '../expense-financial-cash-flow/expense-financial-cash-flow.component';
import { RevenueFinancialCashFlowComponent } from '../revenue-financial-cash-flow/revenue-financial-cash-flow.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';


export interface DetailsTable {
  method: string | undefined;
  revenue: string | undefined;
  expense: string | undefined;
  finalBalance: string | undefined;
}

@Component({
  selector: 'app-transactions-financial-cash-flow',
  imports: [
    MatTabsModule,
    ExpenseFinancialCashFlowComponent,
    RevenueFinancialCashFlowComponent,
    CommonModule,
    MatTableModule
  ],
  templateUrl: './transactions-financial-cash-flow.component.html',
  styleUrl: './transactions-financial-cash-flow.component.scss'
})
export class TransactionsFinancialCashFlowComponent {
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
