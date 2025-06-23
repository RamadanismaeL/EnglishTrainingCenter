import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { TitleNavbarService } from '../../../../_services/title-navbar.service';
import { FinancialService } from '../../../../_services/financial.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ListFinancialExpenseCreatePendingDto } from '../../../../_interfaces/list-financial-expense-create-pending-dto';
import { TableFixedAmountActionComponent } from '../table-fixed-amount-action/table-fixed-amount-action.component';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  selector: 'app-expense-fixed-costs',
  imports: [
    AgGridAngular,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    MatInputModule,
    CommonModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    ReactiveFormsModule
  ],
  templateUrl: './expense-fixed-costs.component.html',
  styleUrl: './expense-fixed-costs.component.scss'
})
export class ExpenseFixedCostsComponent implements OnInit, OnDestroy {
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
              'Pending': {
                class: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
                text: 'Pending'
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
        },
        {
          headerName: 'Actions',
          minWidth: 80, flex: 1,
          cellRenderer: TableFixedAmountActionComponent,
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
  gridApi!: GridApi;

  private readonly fb = inject(FormBuilder);
  form! : FormGroup;
  previousAmountValue: string = '';

  private financialCreate = {} as ListFinancialExpenseCreatePendingDto;

  constructor(private financialService: FinancialService, private notificationHub: NotificationHubService, private alert: SnackBarService, private titleNavbarService: TitleNavbarService)
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

  onAmount(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/[^\d]/g, '');

    const numberValue = this.parseNumber(value);

    // Validação de limite
    if (numberValue > 10000000) {
      input.value = this.previousAmountValue || '';
      return;
    }

    input.value = this.formatNumber(value);
    this.previousAmountValue = input.value;
  }

  formatNumber(value: string): string {
    if (value.endsWith(',')) {
      let integerPart = value.replace(',', '').replace(/\D/g, '');
      integerPart = integerPart.replace(/^0+/, '') || '0';
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return integerPart + ',';
    }

    let [integerPart, decimalPart] = value.split(',');

    integerPart = integerPart.replace(/\D/g, '');
    integerPart = integerPart.replace(/^0+/, '') || '0';
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (decimalPart !== undefined) {
      decimalPart = decimalPart.replace(/\D/g, '').substring(0, 2);
      return integerPart + ',' + decimalPart;
    }

    return integerPart;
  }

  parseNumber(formattedValue: string): number {
    const numberString = formattedValue.replace(/\./g, '').replace(',', '.');
    return parseFloat(numberString) || 0;
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
      this.financialService.getListPending().subscribe((data: any) => {
        this.rowData = data;
        this.applyPagination();
      })
    );

    this.form = this.fb.group({
      description : ['', [Validators.required, Validators.nullValidator]],
      amountMT : ['', [Validators.required, Validators.nullValidator]]
    });
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  onAdd() {
    //console.log("New works")
    if (this.form.valid)
    {
      this.financialCreate = {
        description: this.capitalizeWords(this.form.value.description),
        amountMT: this.parseNumber(this.form.value.amountMT)
      }
      //console.log("Add = ",this.financialCreate)
      this.subs.add(
        this.financialService.createPending(this.financialCreate).subscribe({
          next: (response) => {
            this.alert.show(response.message, 'success');
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 400) {
              this.alert.show('An error occurred while creating.', 'error');
            } else if (error.status === 401) {
              this.alert.show('Oops! Unauthorized!', 'error');
            } else if (error.status === 403) {
              this.alert.show('Oops! Access denied. You do not have permission.', 'error');
            } else if (error.status === 404) {
              this.alert.show('Oops! Not found!', 'error');
            }  else if (error.status >= 500) {
              this.alert.show('Oops! The server is busy!', 'error');
            } else {
            this.alert.show('Oops! An unexpected error occurred.', 'error');
            }
          }
        })
      );
    }
    else
    {
      this.markFormGroupTouched(this.form);
    }
  }

  onClear() {
    this.form.reset();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();

        if (control instanceof FormGroup) {
            this.markFormGroupTouched(control);
        }
    });
  }

  private capitalizeWords(value: string | null): string {
    if (value === null) return '';

    return value
      .toLowerCase()
      .split(' ')
      .map(word =>
        word.length > 0 && word.length != 1
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word
      )
      .join(' ');
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
