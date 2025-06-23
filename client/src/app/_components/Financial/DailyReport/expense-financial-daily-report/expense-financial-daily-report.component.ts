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
import 'jspdf-autotable';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { FinancialService } from '../../../../_services/financial.service';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  selector: 'app-expense-financial-daily-report',
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
  templateUrl: './expense-financial-daily-report.component.html',
  styleUrl: './expense-financial-daily-report.component.scss'
})
export class ExpenseFinancialDailyReportComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[1]);
  positionT = new FormControl(this.positionOptions[0]);

  columnDefs: ColDef[] =
      [
        {
          headerName: 'Description',
          field: 'description', minWidth: 300, flex: 1,
          cellClass: 'custom-cell-start',
          autoHeight: true,
          wrapText: true,
        },
        {
          headerName: 'P. Method',
          field: 'method', minWidth: 110, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Amount (MT)',
          field: 'amountMTFormatted', minWidth: 130, flex: 1,
          cellClass: 'custom-cell-end'
          //valueFormatter: (params) => this.formatAmount(params.value)
        },
        {
          headerName: 'Status',
          field: 'status',
          minWidth: 130,
          flex: 1,
          cellClass: 'custom-cell-center',
          cellRenderer: (params: any) => {
            const status = params.value?.trim() || 'Error';
            const statusMap: Record<string, { class: string; text: string }> = {
              'Paid': {
                class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                text: 'Paid'
              },
              'Cancelled': {
                class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                text: 'Cancelled'
              }
            };

            const statusConfig = statusMap[status] || {
              class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              text: 'Error'
            };

            return `
              <span class="px-2 py-1 rounded-[7px] text-[12pt] font-normal ${statusConfig.class}">
                ${statusConfig.text}
              </span>
            `;
          }
        },
        {
          headerName: 'Date & Time',
          field: 'lastUpdate', minWidth: 240, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'User',
          field: 'trainerName', minWidth: 200, flex: 1,
          cellClass: 'custom-cell-start'
        }
      ];

  rowData: any[] = [];
  filteredData: any[] = [];
  searchText: string = '';
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  startIndex: number = 0;
  endIndex: number = 0;

  rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "singleRow",
    checkboxes: false,
    enableClickSelection: true
  };

  private subs = new Subscription();

  constructor(private financialService: FinancialService, private notificationHub: NotificationHubService)
  {}

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
      this.financialService.getListDailyReport().subscribe((data: any) => {
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
}
