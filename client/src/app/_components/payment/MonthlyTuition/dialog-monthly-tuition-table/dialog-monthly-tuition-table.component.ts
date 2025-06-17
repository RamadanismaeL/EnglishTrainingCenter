import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { StudentCourseInfoService } from '../../../../_services/student-course-info.service';
import { TitleNavbarService } from '../../../../_services/title-navbar.service';
import { RouterLink } from '@angular/router';
import { PaymentPayNowMonthlyTuitionService } from '../../../../_services/payment-pay-now-monthly-tuition.service';

@Component({
  selector: 'app-dialog-monthly-tuition-table',
  imports: [
    MatIconModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './dialog-monthly-tuition-table.component.html',
  styleUrl: './dialog-monthly-tuition-table.component.scss'
})
export class DialogMonthlyTuitionTableComponent implements ICellRendererAngularComp {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  positionL = new FormControl(this.positionOptions[2]);

  params: any;
  private subs: Subscription = new Subscription();

  constructor (private titleNavbarService: TitleNavbarService, private studentCourseInfo: StudentCourseInfoService, private alert: SnackBarService, private payNowMonthlyTuition: PaymentPayNowMonthlyTuitionService)
  {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  navigateTo (breadcrumbs: { label: string, url?: any[] }) {
    this.titleNavbarService.addBreadcrumb(breadcrumbs);

    /*
    console.log
    (
      "PAYMENT DATA",
      "\nStudent ID: ",this.params.data.studentID,
      "\nDescription: ",this.params.data.description,
      "\nAmount (MT): ",this.params.data.amount,
      "\n\n",
      "\nMONTHLY TUITION DATA",
      "\nOrder: ",this.params.data.orderMonthlyTuition
    )
      */

    this.payNowMonthlyTuition.setEnrollmentStudent({
      orderMonthlyTuition: this.params.data.orderMonthlyTuition,
      studentId: this.params.data.studentID,
      description: this.params.data.description,
      amountToPay: this.params.data.amount
    });
  }

  onCancel()
  {
    //console.log('student name: ', this.params.data.fullName, 'order: ', this.params.data.orderMonthlyTuition);
    this.subs.add(
      this.studentCourseInfo.statusMonthlyTuition(this.params.data.orderMonthlyTuition, "Cancelled").subscribe({
        next: (response) => {
          this.alert.show(response.message, 'success');
        },
        error: (error) => {
          this.alert.show(error.error.message, 'error');
        }
      })
    );
  }
}
