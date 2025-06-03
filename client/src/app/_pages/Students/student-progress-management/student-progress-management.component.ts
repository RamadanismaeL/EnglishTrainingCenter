import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry, ColDef, GridApi, RowSelectionOptions } from 'ag-grid-community';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import 'jspdf-autotable';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { MatSelectModule } from '@angular/material/select';
import { TrainersService } from '../../../_services/trainers.service';
import { NotificationHubService } from '../../../_services/notification-hub.service';
import { TitleNavbarService } from '../../../_services/title-navbar.service';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  standalone: true,
  selector: 'app-student-progress-management',
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
  templateUrl: './student-progress-management.component.html',
  styleUrl: './student-progress-management.component.scss'
})
export class StudentProgressManagementComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[1]);
  positionT = new FormControl(this.positionOptions[0]);

  columnDefs: ColDef[] =
      [
        {
          headerName: 'Full Name',
          field: 'fullName', minWidth: 280, flex: 1,
          cellClass: 'custom-cell-start'
        },
        {
          headerName: 'Level',
          field: 'level', minWidth: 70, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Schedule',
          field: 'schedule', minWidth: 110, flex: 1,
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
          headerName: 'Status',
          field: 'status', minWidth: 110, flex: 1,
          cellClass: 'custom-cell-center',
          cellRenderer: (params: any) => {
            if (params.value === 'In Progress')
            { return `<span style="color: #1c1c1c;">${ params.value }</span>` }
            else if (params.value == 'Failed')
            { return `<span style="color: red;">${ params.value }</span>` }
            else if (params.value == 'Pass')
            { return `<span style="color: #3A86FF;">${ params.value }</span>` }
            else
            { return '<span style="color: red; font-weight: bold;">Error</span>' }
          }
        },
        {
          headerName: 'Scheduled Date',
          field: 'scheduledDate', minWidth: 110, flex: 1,
          cellClass: 'custom-cell-center'
        }        
      ];

  rowData: any[] = [];
  filteredData: any[] = [];
  searchText: string = '';

  rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "multiRow",
    checkboxes: true,
    enableClickSelection: true
  };

  private subs = new Subscription();
  gridApi!: GridApi;

  constructor(private trainerService: TrainersService, private notificationHub: NotificationHubService, private titleNavbarService: TitleNavbarService)
  {}

  navigateTo (breadcrumbs: { label: string, url?: any[] }) {
    this.titleNavbarService.addBreadcrumb(breadcrumbs);
  }

  private formatToPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  formatDate(date: Date | string | null): string {
    if (!date) return '';

    const d = new Date(date);
    return isNaN(d.getTime())
      ? ''
      : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  /*
  ngAfterViewInit() {
    console.log(typeof this.pageSize); // Deve mostrar "number"
  }
    */

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
      this.trainerService.detailsSubsidy().subscribe((data: any) => {
        this.rowData = data;

        const dataToPaginate = this.searchText ? this.filteredData : this.rowData;
        this.filteredData = dataToPaginate;
      })
    );
  }

  onSearch()
  {
    const searchLower = this.searchText.toLowerCase();
    this.filteredData = this.rowData.filter(item =>
      Object.values(item).some(val => val?.toString().toLowerCase().includes(searchLower))
    );
  }
}
