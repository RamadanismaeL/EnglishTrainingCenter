import { Component } from '@angular/core';
import { TransactionsFinancialDailyReportComponent } from "../../DailyReport/transactions-financial-daily-report/transactions-financial-daily-report.component";
import { TransactionsFinancialCashFlowComponent } from "../transactions-financial-cash-flow/transactions-financial-cash-flow.component";

@Component({
  selector: 'app-bottom-financial-cash-flow',
  imports: [
    TransactionsFinancialCashFlowComponent
],
  templateUrl: './bottom-financial-cash-flow.component.html',
  styleUrl: './bottom-financial-cash-flow.component.scss'
})
export class BottomFinancialCashFlowComponent {
}
