import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { TitleNavbarService } from '../../../_services/title-navbar.service';
import { DialogManageEvalutionsEditGradeTableComponent } from '../dialog-manage-evalutions-edit-grade-table/dialog-manage-evalutions-edit-grade-table.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-btn-student-quizzes-exam-action-table',
  imports: [
    MatIconModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './btn-student-quizzes-exam-action-table.component.html',
  styleUrl: './btn-student-quizzes-exam-action-table.component.scss'
})
export class BtnStudentQuizzesExamActionTableComponent implements ICellRendererAngularComp {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  positionL = new FormControl(this.positionOptions[2]);

  params: any;

  constructor (private titleNavbarService: TitleNavbarService, private dialog: MatDialog)
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
    this.dialog.open(DialogManageEvalutionsEditGradeTableComponent);
  }
}
