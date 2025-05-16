import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, RowSelectionOptions } from 'ag-grid-community';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

export interface IQuizzesExams {
  level: string | undefined;
  quizOne: string | undefined;
  quizTwo: string | undefined;
  exam: string | undefined;
  finalAverage: string | undefined;
  status: string | undefined;
  date: string | undefined;
}

@Component({
  selector: 'app-student-quizzes-exam-detail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './student-quizzes-exam-detail.component.html',
  styleUrl: './student-quizzes-exam-detail.component.scss'
})
export class StudentQuizzesExamDetailComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
    position = new FormControl(this.positionOptions[2]);

  displayedColumns: string[] = ['level', 'quizOne', 'quizTwo', 'exam', 'finalAverage', 'status', 'date'];

  dataSource: IQuizzesExams[] =
  [
    {level: 'A1', quizOne: '0,00 %', quizTwo: '0,00 %', exam: '0,00 %', finalAverage: '0,00 %', status: 'Faild', date: '2025/02/21'},
    {level: 'A1', quizOne: '0,00 %', quizTwo: '0,00 %', exam: '0,00 %', finalAverage: '0,00 %', status: 'Pass', date: '2025/03/21'},
    {level: 'A1', quizOne: '0,00 %', quizTwo: '0,00 %', exam: '0,00 %', finalAverage: '0,00 %', status: 'In-Progress', date: '--'}
  ];

  columnDefsQuizzesExamEdit: ColDef[] =
      [
        {
          headerName: 'Level',
          field: 'level', minWidth: 90, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Quiz 1',
          field: 'quizOne', flex: 1,
          cellClass: 'custom-cell-center',
          editable: true
        },
        {
          headerName: 'Quiz 2',
          field: 'quizTwo', flex: 1,
          cellClass: 'custom-cell-center',
          editable: true
        },
        {
          headerName: 'Exam',
          field: 'exam', flex: 1,
          cellClass: 'custom-cell-center',
          editable: true
        },
        {
          headerName: 'Final Average',
          field: 'finalAverage', flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Status',
          field: 'status', flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Date',
          field: 'date', flex: 1,
          cellClass: 'custom-cell-center'
        }
      ];

  rowSelection: RowSelectionOptions | "single" | "multiple" = {
      mode: "singleRow",
      checkboxes: false,
      enableClickSelection: true
    };

  private subs = new Subscription();
  editStudentDetailsQuizzes : boolean = false;

  constructor (private notificationHub: NotificationHubService)
  {}

  ngOnInit(): void {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        //this.loadDetails();
      })
    );

    //this.loadDetails();
    this.editStudentDetailsQuizzes = !this.editStudentDetailsQuizzes;
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onCancelQuizzesExam()
  {
    this.editStudentDetailsQuizzes = !this.editStudentDetailsQuizzes;
  }

  onEditQuizzesExam()
  {
    this.editStudentDetailsQuizzes = !this.editStudentDetailsQuizzes;
  }
}
