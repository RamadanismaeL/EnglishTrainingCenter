import { Component } from '@angular/core';
import { BottomFinancialCashFlowComponent } from '../../../_components/Financial/CashFlow/bottom-financial-cash-flow/bottom-financial-cash-flow.component';

@Component({
  standalone: true,
  selector: 'app-financial-cash-flow',
  imports: [BottomFinancialCashFlowComponent],
  templateUrl: './financial-cash-flow.component.html',
  styleUrl: './financial-cash-flow.component.scss'
})
export class FinancialCashFlowComponent {

}
