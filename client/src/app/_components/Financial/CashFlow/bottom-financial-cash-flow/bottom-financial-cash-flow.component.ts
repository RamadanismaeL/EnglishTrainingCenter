import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ChartFinancialCashFlowComponent } from "../chart-financial-cash-flow/chart-financial-cash-flow.component";
import { TransactionsFinancialCashFlowComponent } from '../transactions-financial-cash-flow/transactions-financial-cash-flow.component';

@Component({
  selector: 'app-bottom-financial-cash-flow',
  imports: [
    MatTabsModule,
    ChartFinancialCashFlowComponent,
    TransactionsFinancialCashFlowComponent
],
  templateUrl: './bottom-financial-cash-flow.component.html',
  styleUrl: './bottom-financial-cash-flow.component.scss'
})
export class BottomFinancialCashFlowComponent {

}
