import { Component } from '@angular/core';
import { TopFinancialDailyReportComponent } from '../../../_components/Financial/DailyReport/top-financial-daily-report/top-financial-daily-report.component';
import { BottomFinancialDailyReportComponent } from '../../../_components/Financial/DailyReport/bottom-financial-daily-report/bottom-financial-daily-report.component';

@Component({
  selector: 'app-financial-daily-report',
  imports: [
    TopFinancialDailyReportComponent,
    BottomFinancialDailyReportComponent
  ],
  templateUrl: './financial-daily-report.component.html',
  styleUrl: './financial-daily-report.component.scss'
})
export class FinancialDailyReportComponent {

}
