import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ChartFinancialDailyReportComponent } from '../chart-financial-daily-report/chart-financial-daily-report.component';
import { TransactionsFinancialDailyReportComponent } from '../transactions-financial-daily-report/transactions-financial-daily-report.component';

@Component({
  selector: 'app-bottom-financial-daily-report',
  imports: [
    MatTabsModule,
    ChartFinancialDailyReportComponent,
    TransactionsFinancialDailyReportComponent
  ],
  templateUrl: './bottom-financial-daily-report.component.html',
  styleUrl: './bottom-financial-daily-report.component.scss'
})
export class BottomFinancialDailyReportComponent {

}
