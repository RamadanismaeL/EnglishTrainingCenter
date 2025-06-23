import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { StudentCourseInfoService } from '../../../../_services/student-course-info.service';
import { FinancialService } from '../../../../_services/financial.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { DialogPayNowFinancialExpenseTableComponent } from '../dialog-pay-now-financial-expense-table/dialog-pay-now-financial-expense-table.component';

@Component({
  selector: 'app-table-fixed-amount-action',
  imports: [
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './table-fixed-amount-action.component.html',
  styleUrl: './table-fixed-amount-action.component.scss'
})
export class TableFixedAmountActionComponent implements ICellRendererAngularComp {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  positionL = new FormControl(this.positionOptions[1]);

  params: any;
  private subs: Subscription = new Subscription();

  constructor (private financialService: FinancialService, private alert: SnackBarService, private dialog: MatDialog)
  {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onPayNow() {
    //console.log('id: ', this.params.data.id);
    this.dialog.open(DialogPayNowFinancialExpenseTableComponent, {
      data:
      {
        id: this.params.data.id,
        description: this.params.data.description,
        amountMT: this.params.data.amountMTFormatted
      }
    });
  }

  onDelete() {
    //console.log('id: ', this.params.data.id);
    this.subs.add(
      this.financialService.delete(this.params.data.id).subscribe({
        next: (response) => {
          this.alert.show(response.message, 'success');
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.alert.show(error.error.message, 'error');
          } else if (error.status === 401) {
            this.alert.show('Oops! Unauthorized!', 'error');
          } else if (error.status === 403) {
            this.alert.show('Oops! Access denied. You do not have permission.', 'error');
          } else if (error.status === 404) {
            this.alert.show('Oops! Not found!', 'error');
          }  else if (error.status >= 500) {
            this.alert.show('Oops! The server is busy!', 'error');
          } else {
          this.alert.show('Oops! An unexpected error occurred.', 'error');
          }
        }
      })
    );
  }
}
