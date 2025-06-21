import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { TransactionsFinancialDailyReportComponent } from '../transactions-financial-daily-report/transactions-financial-daily-report.component';

@Component({
  selector: 'app-bottom-financial-daily-report',
  imports: [
    MatTabsModule,
    TransactionsFinancialDailyReportComponent
  ],
  templateUrl: './bottom-financial-daily-report.component.html',
  styleUrl: './bottom-financial-daily-report.component.scss'
})
export class BottomFinancialDailyReportComponent {

}
