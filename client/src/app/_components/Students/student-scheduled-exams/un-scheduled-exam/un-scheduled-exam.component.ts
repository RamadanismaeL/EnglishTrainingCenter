import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry, ColDef, RowSelectionOptions } from 'ag-grid-community';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { MatSelectModule } from '@angular/material/select';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { TitleNavbarService } from '../../../../_services/title-navbar.service';
import { StudentCourseInfoService } from '../../../../_services/student-course-info.service';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  selector: 'app-un-scheduled-exam',
  imports: [
    AgGridAngular,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    CommonModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './un-scheduled-exam.component.html',
  styleUrl: './un-scheduled-exam.component.scss'
})
export class UnScheduledExamComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[1]);
  positionT = new FormControl(this.positionOptions[0]);

  columnDefs: ColDef[] =
      [
        {
          headerName: 'Full Name',
          field: 'fullName', minWidth: 240, flex: 1,
          cellClass: 'custom-cell-start'
        },
        {
          headerName: 'Gender',
          field: 'gender', minWidth: 85, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Package',
          field: 'package', minWidth: 95, flex: 1,
          cellClass: 'custom-cell-center',
          cellRenderer: (params: any) => {
            if (params.value === "Intensive")
            { return '<span style="color: #6A040F;">Intensive</span>'; }
            else if (params.value === "Private")
            { return '<span style="color: #023047;">Private</span>'; }
            else if (params.value === "Regular")
            { return '<span style="color: #014F43;">Regular</span>'; }

            return ""
          }
        },
        {
          headerName: 'Level',
          field: 'level', minWidth: 70, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Modality',
          field: 'modality', minWidth: 95, flex: 1,
          cellClass: 'custom-cell-center',
          cellRenderer: (params: any) => {
            if (params.value === "Online")
            { return '<span style="color: #3A86FF;">Online</span>'; }
            else
            { return '<span style="color: #43AA8B;">In-Person</span>'; }
          }
        },
        {
          headerName: 'Period',
          field: 'academicPeriod', minWidth: 90, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Schedule',
          field: 'schedule', minWidth: 100, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Status',
          field: 'status', minWidth: 130, flex: 1,
          cellClass: 'custom-cell-center'
        }
      ];

  rowData: any[] = [];
  filteredData: any[] = [];
  searchText: string = '';
  pageSize: number = 8;
  currentPage: number = 1;
  totalPages: number = 1;
  startIndex: number = 0;
  endIndex: number = 0;

  rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "multiRow",
    checkboxes: true,
    enableClickSelection: true
  };

  private subs = new Subscription();

  constructor(private studentcourseInfo: StudentCourseInfoService, private notificationHub: NotificationHubService, private titleNavbarService: TitleNavbarService)
  {}

  navigateTo (breadcrumbs: { label: string, url?: any[] }) {
    this.titleNavbarService.addBreadcrumb(breadcrumbs);
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '';

    const d = new Date(date);
    return isNaN(d.getTime())
      ? ''
      : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  ngOnInit(): void
  {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        this.loadData();
      })
    );

    this.loadData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadData(): void
  {
    this.subs.add(
      this.studentcourseInfo.getListStudentUnscheduledExams().subscribe((data: any) => {
        this.rowData = data;
        this.applyPagination();
      })
    );
  }

  onSearch()
  {
    const searchLower = this.searchText.toLowerCase();
    this.filteredData = this.rowData.filter(item =>
      Object.values(item).some(val => val?.toString().toLowerCase().includes(searchLower))
    );
    this.currentPage = 1;
    this.applyPagination();
  }

  onPageSizeChanged()
  {
    this.currentPage = 1;
    this.applyPagination();
  }

  applyPagination()
  {
    const dataToPaginate = this.searchText ? this.filteredData : this.rowData;
    this.totalPages = Math.ceil(dataToPaginate.length / this.pageSize);
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, dataToPaginate.length);
    this.filteredData = dataToPaginate.slice(this.startIndex, this.endIndex);
  }

  gotToPrevious()
  {
    if (this.currentPage > 1)
    {
      this.currentPage--;
      this.applyPagination();
    }
  }

  goToNext()
  {
    if (this.currentPage < this.totalPages)
    {
      this.currentPage++;
      this.applyPagination();
    }
  }

  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage = page;
    } else {
      if (page === '...') {
        return; // Não faz nada quando clicar nas reticências.
      }
    }
    this.applyPagination();
  }

  isNumber(value: number | string): value is number {
    return typeof value === 'number';
  }

  get totalPagesArray(): (number | string)[] {
    const maxVisiblePages = 5;
    const pages = [];

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        pages.push(1, 2, 3, '...', this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1, '...', this.totalPages - 2, this.totalPages - 1, this.totalPages);
      } else {
        pages.push(1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages);
      }
    }

    return pages;
  }

  gridApi: any;
  gridColumnApi: any;

  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  getSelectedStudentIds(): string[] {
    const selectedNodes = this.gridApi.getSelectedNodes();
    return selectedNodes.map((node: { data: { idScheduleExam: any; }; }) => node.data.idScheduleExam);
  }

  markScheduled(): void {
    //console.log("Selected students completed: ", this.getSelectedStudentIds());
    if (this.getSelectedStudentIds().length > 0) {
      this.subs.add(
        this.studentcourseInfo.updateUnsheduledExams(this.getSelectedStudentIds()).subscribe({
          next: (response) => {
            this.notificationHub.sendMessage(response.message);
            this.loadData();
          },
          error: (error) => {
            this.notificationHub.sendMessage(error.error.message);
          }
        })
      );
    }
  }
}
