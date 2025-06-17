import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { StudentCourseInfoService } from '../../../../_services/student-course-info.service';
import { TitleNavbarService } from '../../../../_services/title-navbar.service';
import { DialogScheduleExamsComponent } from '../../../Students/dialog-schedule-exams/dialog-schedule-exams.component';

@Component({
  selector: 'app-dialog-monthly-tuition-table',
  imports: [
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './dialog-monthly-tuition-table.component.html',
  styleUrl: './dialog-monthly-tuition-table.component.scss'
})
export class DialogMonthlyTuitionTableComponent implements ICellRendererAngularComp {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  positionL = new FormControl(this.positionOptions[2]);

  params: any;
  private subs: Subscription = new Subscription();

  constructor (private titleNavbarService: TitleNavbarService, private dialog: MatDialog, private studentCourseInfo: StudentCourseInfoService, private alert: SnackBarService)
  {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  navigateTo (breadcrumbs: { label: string, url?: any[] }) {
    this.titleNavbarService.addBreadcrumb(breadcrumbs);
  }

  onPayNow()
  {
    this.dialog.open(DialogScheduleExamsComponent, {
      data :
      {
        studentName: this.params.data.fullName,
        id: this.params.data.id,
        exam: this.params.data.exam
      }
    });
  }

  onCancel()
  {
    //console.log('student name: ', this.params.data.fullName, 'order: ', this.params.data.orderMonthlyTuition);
    this.subs.add(
      this.studentCourseInfo.cancelStatusMonthlyTuition(this.params.data.orderMonthlyTuition).subscribe({
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
