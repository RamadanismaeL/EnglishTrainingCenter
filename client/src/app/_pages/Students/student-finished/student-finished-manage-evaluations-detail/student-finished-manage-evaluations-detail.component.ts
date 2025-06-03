
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, RowSelectionOptions } from 'ag-grid-community';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { StudentCourseInfoProgressHistoryDto } from '../../../../_interfaces/student-course-info-progress-history-dto';
import { StudentCourseInfoService } from '../../../../_services/student-course-info.service';
import { StudentShareIdService } from '../../../../_services/student-share-id.service';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { BtnStudentFinishedMEProgressHistoryComponent } from '../../../../_components/Students/btn-student-finished-meprogress-history/btn-student-finished-meprogress-history.component';

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
  selector: 'app-student-finished-manage-evaluations-detail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    MatTableModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './student-finished-manage-evaluations-detail.component.html',
  styleUrl: './student-finished-manage-evaluations-detail.component.scss'
})
export class StudentFinishedManageEvaluationsDetailComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
    position = new FormControl(this.positionOptions[2]);

  fullName: string | undefined = '';

  displayedColumns: string[] = ['level', 'quizOne', 'quizTwo', 'exam', 'finalAverage', 'status', 'dateUpdate'];

  rowDataTableSimple: StudentCourseInfoProgressHistoryDto[] = [];
  modifiedRows: StudentCourseInfoProgressHistoryDto[] = [];

  columnDefsQuizzesExamEdit: ColDef[] =
      [
        {
          editable: false,
          headerName: 'Level',
          field: 'level', minWidth: 90, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Quiz 1',
          field: 'quizOne', minWidth: 110, flex: 1,
          cellClass: 'custom-cell-center',
          cellRenderer: (params: any) => {
            if (params.value == 0)
            { return `<span style="color: #1c1c1c;">${ this.formatToPercentage(params.value) }</span>` }
            else if (params.value > 0 && params.value < 50)
            { return `<span style="color: red;">${ this.formatToPercentage(params.value) }</span>` }
            else if (params.value >= 50 && params.value <= 100)
            { return `<span style="color: #3A86FF;">${ this.formatToPercentage(params.value) }</span>` }
            else
            { return '<span style="color: red; font-weight: bold;">Error</span>' }
          }
        },
        {
          headerName: 'Quiz 2',
          field: 'quizTwo', minWidth: 110, flex: 1,
          cellClass: 'custom-cell-center',
          cellRenderer: (params: any) => {
            if (params.value == 0)
            { return `<span style="color: #1c1c1c;">${ this.formatToPercentage(params.value) }</span>` }
            else if (params.value > 0 && params.value < 50)
            { return `<span style="color: red;">${ this.formatToPercentage(params.value) }</span>` }
            else if (params.value >= 50 && params.value <= 100)
            { return `<span style="color: #3A86FF;">${ this.formatToPercentage(params.value) }</span>` }
            else
            { return '<span style="color: red; font-weight: bold;">Error</span>' }
          }
        },
        {
          headerName: 'Exam',
          field: 'exam', minWidth: 110, flex: 1,
          cellClass: 'custom-cell-center',
          cellRenderer: (params: any) => {
            if (params.value == 0)
            { return `<span style="color: #1c1c1c;">${ this.formatToPercentage(params.value) }</span>` }
            else if (params.value > 0 && params.value < 50)
            { return `<span style="color: red;">${ this.formatToPercentage(params.value) }</span>` }
            else if (params.value >= 50 && params.value <= 100)
            { return `<span style="color: #3A86FF;">${ this.formatToPercentage(params.value) }</span>` }
            else
            { return '<span style="color: red; font-weight: bold;">Error</span>' }
          }
        },
        {
          editable: false,
          headerName: 'Final Average',
          field: 'finalAverage', flex: 1,
          cellClass: 'custom-cell-center',
          cellRenderer: (params: any) => {
            if (params.value == 0)
            { return `<span style="color: #1c1c1c;">${ this.formatToPercentage(params.value) }</span>` }
            else if (params.value > 0 && params.value < 50)
            { return `<span style="color: red;">${ this.formatToPercentage(params.value) }</span>` }
            else if (params.value >= 50 && params.value <= 100)
            { return `<span style="color: #3A86FF;">${ this.formatToPercentage(params.value) }</span>` }
            else
            { return '<span style="color: red; font-weight: bold;">Error</span>' }
          }
        },
        {
          editable: false,
          headerName: 'Status',
          field: 'status', flex: 1,
          cellClass: 'custom-cell-center',
          cellRenderer: (params: any) => {
            if (params.value === 'Canceled')
            { return `<span style="color: #1c1c1c; font-weight: bold">${ params.value }</span>` }
            else if (params.value === 'In Progress')
            { return `<span style="color: #1c1c1c;">${ params.value }</span>` }
            else if (params.value == 'Failed')
            { return `<span style="color: red;">${ params.value }</span>` }
            else if (params.value == 'Pass')
            { return `<span style="color: #0062ff;">${ params.value }</span>` }
            else
            { return '<span style="color: red; font-weight: bold;">Error</span>' }
          }
        },
        {
          editable: false,
          headerName: 'Date',
          field: 'dateUpdate', flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Actions',
          minWidth: 110, flex: 1,
          cellRenderer: BtnStudentFinishedMEProgressHistoryComponent,
          cellClass: 'custom-cell-center'
        }
      ];

  rowSelection: RowSelectionOptions | "single" | "multiple" = {
      mode: "singleRow",
      checkboxes: false,
      enableClickSelection: true
    };

    // Configuração dos Grids para atualização directamente na tabela
  gridOptions: GridOptions = {
    defaultColDef: {
      editable: true,
      sortable: false,
      filter: false,
      resizable: false,
    },
    onCellValueChanged: (event) => {
      this.addToModified(event.data);
    },
  };

  private subs = new Subscription();
  editStudentDetailsQuizzes : boolean = false;

  constructor (private notificationHub: NotificationHubService, private studentShareId: StudentShareIdService, private studentCourseInfo: StudentCourseInfoService, private alert: SnackBarService)
  {
    //console.log('Order received: ', this.studentShareId.currentEnrollment);
  }

  ngOnInit(): void {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        this.loadDetails();
      })
    );

    this.loadDetails();
    this.editStudentDetailsQuizzes = !this.editStudentDetailsQuizzes;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  formatToPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  onCancelQuizzesExam()
  {
    this.editStudentDetailsQuizzes = !this.editStudentDetailsQuizzes;
  }

  onEditQuizzesExam()
  {
    this.editStudentDetailsQuizzes = !this.editStudentDetailsQuizzes;
  }

  loadDetails()
  {
    this.subs.add(
      this.studentCourseInfo.getListStudentCourseInfoProgressHistoryByOrder(this.studentShareId.currentEnrollment).subscribe(data => {
         this.rowDataTableSimple = Array.isArray(data) ? data : [data];
         this.fullName = Array.isArray(data) && data.length > 0 ? data[0].fullName : data.fullName;
      })
    );
  }

  // Método para adicionar na lista de modificados
  addToModified(row: StudentCourseInfoProgressHistoryDto) {
    const index = this.modifiedRows.findIndex(item => item.order === row.order);
    if (index >= 0) {
      this.modifiedRows[index] = row; // Atualiza se já existir
    } else {
      this.modifiedRows.push(row); // Adiciona se for novo
    }
  }

  onSave() {
    if (this.modifiedRows.length === 0) {
      this.alert.show('No changes to save!', 'warning');
      return;
    }

    this.subs.add(
      this.modifiedRows.forEach((quizzes) => {
        this.studentCourseInfo.updateQuiz(quizzes).subscribe({
          error: (error) => {
            console.error('Error:', error);
            this.alert.show('An error occurred while updating.', 'error');
          },
        });
      })
    )

    // 🔥 Limpa a lista após salvar
    this.modifiedRows = [];
    this.editStudentDetailsQuizzes = !this.editStudentDetailsQuizzes;
  }
}
