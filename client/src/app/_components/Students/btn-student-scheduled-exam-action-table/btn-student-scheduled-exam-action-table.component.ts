import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { TitleNavbarService } from '../../../_services/title-navbar.service';
import { DialogManageEvalutionsEditGradeTableComponent } from '../dialog-manage-evalutions-edit-grade-table/dialog-manage-evalutions-edit-grade-table.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogScheduleExamsComponent } from '../dialog-schedule-exams/dialog-schedule-exams.component';
import { Subscription } from 'rxjs';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { StudentCourseInfoService } from '../../../_services/student-course-info.service';

@Component({
  selector: 'app-btn-student-scheduled-exam-action-table',
  imports: [
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './btn-student-scheduled-exam-action-table.component.html',
  styleUrl: './btn-student-scheduled-exam-action-table.component.scss'
})
export class BtnStudentScheduledExamActionTableComponent implements ICellRendererAngularComp {
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

  onEdit()
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

  onUnshedule()
  {
    //console.log('Unshedule exam for student: ', this.params.data.fullName, 'id: ', this.params.data.id);
    this.subs.add(
      this.studentCourseInfo.cancelSheduledExams(this.params.data.id).subscribe({
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
