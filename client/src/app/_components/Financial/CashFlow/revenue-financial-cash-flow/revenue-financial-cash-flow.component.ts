import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry, ColDef, RowSelectionOptions } from 'ag-grid-community';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import 'jspdf-autotable';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { FinancialService } from '../../../../_services/financial.service';
import { BtnTransactionsReceiptComponent } from '../../btn-transactions-receipt/btn-transactions-receipt.component';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  selector: 'app-revenue-financial-cash-flow',
  imports: [
    AgGridAngular,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    MatInputModule,
    CommonModule
  ],
  templateUrl: './revenue-financial-cash-flow.component.html',
  styleUrl: './revenue-financial-cash-flow.component.scss'
})
export class RevenueFinancialCashFlowComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[1]);
  positionT = new FormControl(this.positionOptions[0]);

  columnDefs: ColDef[] =
      [
        {
          headerName: 'Description',
          field: 'descriptionEnglish', minWidth: 300, flex: 1,
          cellClass: 'custom-cell-center',
          autoHeight: true,
          wrapText: true,
        },
        {
          headerName: 'Received From',
          field: 'receivedFrom', minWidth: 240, flex: 1,
          cellClass: 'custom-cell-start'
        },
        {
          headerName: 'Method',
          field: 'method', minWidth: 90, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'Amount (MT)',
          field: 'amountMT', minWidth: 130, flex: 1,
          cellClass: 'custom-cell-end',
          valueFormatter: (params) => this.formatAmount(params.value)
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
          field: 'dateRegister', minWidth: 200, flex: 1,
          cellClass: 'custom-cell-center'
        },
        {
          headerName: 'User',
          field: 'trainerName', minWidth: 200, flex: 1,
          cellClass: 'custom-cell-start'
        },
        {
          headerName: 'Receipt',
          minWidth: 130, flex: 1,
          cellRenderer: BtnTransactionsReceiptComponent,
          cellClass: 'custom-cell-center'
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
      this.financialService.getListCashFlowRevenue().subscribe((data: any) => {
        this.rowData = data;
        this.applyPagination();
      })
    );
  }

  formatAmount(value: number | undefined | string): string {
    if (value === null || value === undefined || value === '') return '';

    let numberValue: number;

    if (typeof value === 'string') {
      const cleanedValue = value.replace(/\./g, '').replace(',', '.');
      numberValue = parseFloat(cleanedValue);
    } else {
      numberValue = value;
    }

    if (isNaN(numberValue)) return '';

    // Formatação manual com regex
    return numberValue.toFixed(2)
      .replace('.', ',') // Substitui ponto decimal por vírgula
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona pontos nos milhares
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
