import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ExpenseFixedCostsComponent } from "../../../_components/Financial/Expenses/expense-fixed-costs/expense-fixed-costs.component";
import { ExpenseOverviewComponent } from "../../../_components/Financial/Expenses/expense-overview/expense-overview.component";

@Component({
  standalone: true,
  selector: 'app-financial-expense',
  imports: [
    MatTabsModule,
    ExpenseFixedCostsComponent,
    ExpenseOverviewComponent
],
  templateUrl: './financial-expense.component.html',
  styleUrl: './financial-expense.component.scss'
})
export class FinancialExpenseComponent {

}
