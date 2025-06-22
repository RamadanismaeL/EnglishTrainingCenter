import { Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { FinancialService } from '../../../../_services/financial.service';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-btn-table-action',
  imports: [
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './btn-table-action.component.html',
  styleUrl: './btn-table-action.component.scss'
})
export class BtnTableActionComponent implements ICellRendererAngularComp, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  positionL = new FormControl(this.positionOptions[2]);
  positionR = new FormControl(this.positionOptions[3]);

  params: any;
  private subs: Subscription = new Subscription();

  constructor (private financialService: FinancialService, private alert: SnackBarService)
  {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onCancel() {
    //console.log('Cancel id: ', this.params.data.id);
    this.subs.add(
      this.financialService.updateStatus(this.params.data.id).subscribe({
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
