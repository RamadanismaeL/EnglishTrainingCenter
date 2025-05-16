import { Component } from '@angular/core';
import { TopFinancialCashFlowComponent } from "../../../_components/Financial/CashFlow/top-financial-cash-flow/top-financial-cash-flow.component";
import { BottomFinancialCashFlowComponent } from '../../../_components/Financial/CashFlow/bottom-financial-cash-flow/bottom-financial-cash-flow.component';

@Component({
  selector: 'app-financial-cash-flow',
  imports: [TopFinancialCashFlowComponent, BottomFinancialCashFlowComponent],
  templateUrl: './financial-cash-flow.component.html',
  styleUrl: './financial-cash-flow.component.scss'
})
export class FinancialCashFlowComponent {

}
