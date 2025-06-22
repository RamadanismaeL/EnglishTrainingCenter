import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry, ColDef, GridApi, GridReadyEvent, RowSelectionOptions } from 'ag-grid-community';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { lastValueFrom } from 'rxjs';
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import printJS from 'print-js';
import { MatSelectModule } from '@angular/material/select';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { TitleNavbarService } from '../../../../_services/title-navbar.service';
import { FinancialService } from '../../../../_services/financial.service';
import { BtnTableActionComponent } from '../btn-table-action/btn-table-action.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ListFinancialExpenseCreateDto } from '../../../../_interfaces/list-financial-expense-create-dto';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  standalone: true,
  selector: 'app-expense-overview',
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
    MatMenuModule,
    ReactiveFormsModule
  ],
  templateUrl: './expense-overview.component.html',
  styleUrl: './expense-overview.component.scss'
})
export class ExpenseOverviewComponent implements OnInit, OnDestroy {
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
              'Approved': {
                class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                text: 'Approved'
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
          cellRenderer: BtnTableActionComponent,
          cellClass: 'custom-cell-center'
        }
      ];

  rowData: any[] = [];
  filteredData: any[] = [];
  searchText: string = '';
  pageSize: number = 20;
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
  //tableModules = [ ExcelExportModule ] //Versão enterprise do ag-grid
  // html := [modules]="tableModules"

  //private currentYear = new Date().getFullYear();
  private author = "Ramadan IsmaeL";
  private institution = "English Training Center";
// &copy; 2025 | Ramadan I.A. Ismael · License: English Training Center · All rights reserved
  private footer = `© 2025 | ${this.author} · License: ${this.institution} · All rights reserved.`;

  private readonly fb = inject(FormBuilder);
  form! : FormGroup;
  previousAmountValue: string = '';

  private financialCreate = {} as ListFinancialExpenseCreateDto;

  constructor(private financialService: FinancialService, private notificationHub: NotificationHubService, private alert: SnackBarService, private clipboard: Clipboard, private titleNavbarService: TitleNavbarService)
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
      this.financialService.getListAll().subscribe((data: any) => {
        this.rowData = data;
        this.applyPagination();
      })
    );

    this.form = this.fb.group({
      description : ['', [Validators.required, Validators.nullValidator]],
      amountMT : ['', [Validators.required, Validators.nullValidator]],
      payoutMethod : ['', [Validators.required, Validators.nullValidator]]
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
        method: this.form.value.payoutMethod,
        amountMT: this.form.value.amountMT
      }
      //console.log("Add = ",this.financialCreate)
      this.subs.add(
        this.financialService.create(this.financialCreate).subscribe({
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

  copy = false;
  excel = false;
  pdf = false;
  print = false;

  toggleBtn(format: string)
  {
    switch (format)
    {
      case 'copy' :
        this.copy = !this.copy;
        break;
      case 'excel' :
        this.excel = !this.excel;
        break;
      case 'pdf' :
        this.pdf = !this.pdf;
        break;
      case 'print' :
        this.print = !this.print;
        break;
      default:
        console.error('Unsupported format:', format);
    }
  }

  async onExport(format: string): Promise<void>
  {
    try
    {
      switch (format)
      {
        case 'copyAllData':
          this.copy = false;
          await this.copyAllDataTable();
          break;
        case 'copyFiltered':
          await this.copyFilteredTable();
          break;
        case 'exportExcelAllData':
          await this.exportExcelAllDataTable(); //Versão enterprise do ag-grid
          break;
        case 'exportExcelFiltered':
          await this.exportExcelFilteredTable(); //Versão enterprise do ag-grid
          break;
        case 'exportPdfAllData':
          await this.exportPdfAllDataTable();
          break;
        case 'exportPdfFiltered':
          await this.exportPdfFilteredTable();
          break;
        case 'printAllData':
          await this.printAllDataTable();
          break;
        case 'printFiltered':
          await this.printFilteredTable();
          break;
        default:
          console.error('Unsupported format:', format);
      }
    } catch (error) {
      this.handleExportError(error, format);
    }
  }

  gridState: {
    isReady: boolean;
    isLoading: boolean;
    error: string | null;
  } = {
    isReady: false,
    isLoading: true,
    error: null
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridState.isReady = true;
    this.gridState.isLoading = false;
  }

  @ViewChild('agGrid') agGrid!: AgGridAngular;

  private async copyAllDataTable(): Promise<void> {
    try {
      // 1. Busca todos os dados dos trainers
      const response = await lastValueFrom(this.financialService.getListAll());
      const trainers = Array.isArray(response) ? response : [response];

      if (!trainers.length) {
        this.alert.show('No data available.', 'warning');
        return;
      }

      const ignoreKeys = ['id'];
      const orderedKeys = ['description', 'method', 'amountMTFormatted', 'lastUpdate', 'status', 'trainerName']; // ordem desejada

      // Filtra a ordem excluindo colunas ignoradas
      const finalKeys = orderedKeys.filter(key => !ignoreKeys.includes(key));

      // Cabeçalhos em ordem filtrada
      const headers = finalKeys.join('\t');

      const csvData = [
        headers,
        ...trainers.map(trainer =>
          finalKeys.map(key => trainer[key] ?? '').join('\t')
        )
      ].join('\n');

      // 3. Copia para clipboard
      try {
        await navigator.clipboard.writeText(csvData);
        this.alert.show('All data copied.', 'success');
      } catch (clipboardError) {
        this.clipboard.copy(csvData); // Fallback
        this.alert.show('All data copied (fallback).', 'success');
      }

    } catch (error) {
      console.error('Error copying data:', error);
      this.alert.show('Error copying data.', 'error');
    }
  }

  private async copyFilteredTable() : Promise<void> {
    if (!this.gridApi) {
      throw new Error('Grid uninitialized.');
    }

    const csvData = this.gridApi.getDataAsCsv({
      suppressQuotes: true,
      columnSeparator: '\t',
      onlySelected: this.gridApi.getSelectedNodes().length > 0
    });

    // Método moderno com fallback
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(csvData!);
      } else {
        this.clipboard.copy(csvData!);
      }
      this.alert.show('Filtered data copied.', 'success')
    } catch (err) {
      throw new Error('Oops..! Error to filtered data.');
    }
  }

  private async exportExcelAllDataTable(): Promise<void> {
    try {
      // 1. Fetch all trainer data
      const response = await lastValueFrom(this.financialService.getListAll());

      // Validate response
      if (!response) {
        this.alert.show('No data available for export.', 'warning');
        return;
      }

       // 2. Ensure data is an array
      const students = Array.isArray(response) ? response : [response];

      //console.log('Exporting:', trainers);

      // 4. Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Trainers');

      const excelColumns = [
        { header: 'Description', key: 'description', width: 70 },
        { header: 'P. Method', key: 'method', width: 20 },
        { header: 'Amount (MT)', key: 'amountMTFormatted', width: 20 },
        { header: 'Last Update', key: 'lastUpdate', width: 40 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'User', key: 'trainerName', width: 40 }
      ];

      // 2. Definir manualmente os valores do cabeçalho na linha 4
      worksheet.getRow(4).height = 25;
      const headerRow = worksheet.getRow(4);
      headerRow.values = excelColumns.map(col => col.header);

      worksheet.columns = excelColumns;

      // 3. Formatar o cabeçalho
      headerRow.eachCell({ includeEmpty: true }, cell => {
        cell.font = {
          size: 14,
          bold: true,
          color: { argb: 'FFFFFFFF' }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '643887' } // Roxo
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // 5. Add data SAFELY (only mapped columns)
      students.forEach((student, index) => {
        const rowNumber = index + 5; // Começa da linha 5
        worksheet.getRow(rowNumber).values = [
          student.description ?? '',
          student.method ?? '',
          student.amountMTFormatted ?? '',
          student.lastUpdate ?? '',
          student.status ?? '',
          student.trainerName ?? ''
        ];
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 4) { // Ignora o cabeçalho (linha 1)
          worksheet.getRow(rowNumber).height = 20;

          row.eachCell({ includeEmpty: true }, cell => {
            // Estilo padrão para todas as células de dados
            cell.font = { size: 12, bold: false, color: { argb: 'FF000000' } }; // Preto
            cell.alignment = { vertical: 'middle', horizontal: 'center' };

            const columnLetter = worksheet.getColumn(cell.col).letter;

            if (['A', 'F'].includes(columnLetter)) {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }

            if (['C'].includes(columnLetter)) {
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            }

            cell.border = {
              top: { style: 'thin', color: { argb: '2c2c2c' } },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        }
      });

      // 1. Função auxiliar para converter imagem em base64
      async function imageToBase64(url: string): Promise<string> {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      try {
        // Converter a imagem para base64
        const logoBase64 = await imageToBase64('images/marca.png');

        // Adicionar ao Excel
        const logoId = workbook.addImage({
          base64: logoBase64.split(',')[1], // Remove o prefixo "data:image/png;base64,"
          extension: 'png'
        });

        worksheet.addImage(logoId, {
          tl: { col: 0, row: 0 },  // Canto superior esquerdo (A1)
          ext: { width: 80, height: 78 } // Tamanho em pixels
        });

      } catch (error) {
        console.warn('Unable to load logo:', error);
        // Continua a exportação sem imagem
      }

      // Descobre a última linha
      // Pula duas linhas e adiciona o footer
      const lastRow = worksheet.lastRow?.number;
      const calc = lastRow! + 2;
      //console.log('LastRow + 2 = ', calc)

      const footer = worksheet.getRow(calc);
      worksheet.mergeCells(`A${calc}:F${calc}`);
      footer.height = 20;
      const myName = worksheet.getCell(`A${calc}`);
      myName.value = this.footer;
      myName.font = { size: 10, color: { argb: 'FFFF0000' } };
      myName.alignment = { vertical: 'middle', horizontal: 'right' };

      worksheet.getRow(3).height = 10;

      worksheet.getRow(1).values = [];
      worksheet.getRow(1).height = 30;
      worksheet.mergeCells('A1:E1');
      const titleCell1 = worksheet.getCell('A1');
      titleCell1.value = 'ENGLISH TRAINING CENTER';
      titleCell1.font = { size: 22, bold: true, color: { argb: 'FF2C2C2C' } };
      titleCell1.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('A2:E2');
      const titleCell2 = worksheet.getCell('A2');
      titleCell2.value = 'Financial : Expenses – Full List';
      titleCell2.font = { size: 20, bold: true, color: { argb: '2C2C2C' } };
      titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };

      // Adicionar data
      const dateCell = worksheet.getCell('F2');
      dateCell.value = `Issued on: ${this.formatDate(new Date())}`;
      dateCell.font = { size: 12, bold: false, color: { argb: '2C2C2C' } };
      dateCell.alignment = { vertical: 'middle', horizontal: 'right' };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      FileSaver.saveAs(blob, 'ETC_financial_expenses_full_list.xlsx');
      this.alert.show('All data exported to Excel.', 'success');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      this.alert.show('Failed to export all data to Excel.', 'error');
    }
  }

  private async exportExcelFilteredTable(): Promise<void> {
    try {
      if (!this.gridApi) {
        throw new Error('Grid uninitialized.');
      }

      // 1. Obter dados VISÍVEIS do grid (com filtros aplicados)
      const students: any[] = [];
      this.gridApi.forEachNodeAfterFilter(node => {
        if (node.data) {
          students.push(node.data);
        }
      });

      // Alternativa para dados SELECIONADOS:
      // const rowData = this.gridApi.getSelectedRows();

      if (!students.length) {
        this.alert.show('No data available for export.', 'warning');
        return;
      }

      // 2. Criar workbook Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Trainers');

      const excelColumns = [
        { header: 'Code', key: 'id', width: 20 },
        { header: 'Full Name', key: 'fullName', width: 40 },
        { header: 'Gender', key: 'gender', width: 15 },
        { header: 'Age', key: 'age', width: 10 },
        { header: 'Package', key: 'package', width: 20 },
        { header: 'Level', key: 'level', width: 10 },
        { header: 'Modality', key: 'modality', width: 20 },
        { header: 'Period', key: 'academicPeriod', width: 15 },
        { header: 'Schedule', key: 'schedule', width: 15 },
      ];

      // 2. Definir manualmente os valores do cabeçalho na linha 4
      worksheet.getRow(4).height = 25;
      const headerRow = worksheet.getRow(4);
      headerRow.values = excelColumns.map(col => col.header);

      worksheet.columns = excelColumns;

      // 3. Formatar o cabeçalho
      headerRow.eachCell({ includeEmpty: true }, cell => {
        cell.font = {
          size: 14,
          bold: true,
          color: { argb: 'FFFFFFFF' }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '643887' } // Roxo
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // 5. Add data SAFELY (only mapped columns)
      students.forEach((student, index) => {
        const rowNumber = index + 5; // Começa da linha 5
        worksheet.getRow(rowNumber).values = [
          student.id ?? '',
          student.fullName ?? '',
          student.gender ?? '',
          student.age ?? '',
          student.package ?? '',
          student.level ?? '',
          student.modality ?? '',
          student.academicPeriod ?? '',
          student.schedule ?? ''
        ];
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 4) { // Ignora o cabeçalho (linha 1)
          worksheet.getRow(rowNumber).height = 20;

          row.eachCell({ includeEmpty: true }, cell => {
            // Estilo padrão para todas as células de dados
            cell.font = { size: 12, bold: false, color: { argb: 'FF000000' } }; // Preto
            cell.alignment = { vertical: 'middle', horizontal: 'center' };

            const columnLetter = worksheet.getColumn(cell.col).letter;

            if (['B'].includes(columnLetter)) {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }

            cell.border = {
              top: { style: 'thin', color: { argb: '2c2c2c' } },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        }
      });

      // 1. Função auxiliar para converter imagem em base64
      async function imageToBase64(url: string): Promise<string> {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      try {
        // Converter a imagem para base64
        const logoBase64 = await imageToBase64('images/marca.png');

        // Adicionar ao Excel
        const logoId = workbook.addImage({
          base64: logoBase64.split(',')[1], // Remove o prefixo "data:image/png;base64,"
          extension: 'png'
        });

        worksheet.addImage(logoId, {
          tl: { col: 0, row: 0 },  // Canto superior esquerdo (A1)
          ext: { width: 80, height: 78 } // Tamanho em pixels
        });

      } catch (error) {
        console.warn('Unable to load logo:', error);
        // Continua a exportação sem imagem
      }

      // Descobre a última linha
      // Pula duas linhas e adiciona o footer
      const lastRow = worksheet.lastRow?.number;
      const calc = lastRow! + 2;
      //console.log('LastRow + 2 = ', calc)

      const footer = worksheet.getRow(calc);
      worksheet.mergeCells(`A${calc}:I${calc}`);
      footer.height = 20;
      const myName = worksheet.getCell(`A${calc}`);
      myName.value = this.footer;
      myName.font = { size: 10, color: { argb: 'FFFF0000' } };
      myName.alignment = { vertical: 'middle', horizontal: 'right' };

      worksheet.getRow(3).height = 10;

      worksheet.getRow(1).values = [];
      worksheet.getRow(1).height = 30;
      worksheet.mergeCells('A1:G1');
      const titleCell1 = worksheet.getCell('A1');
      titleCell1.value = 'ENGLISH TRAINING CENTER';
      titleCell1.font = { size: 22, bold: true, color: { argb: 'FF2C2C2C' } };
      titleCell1.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('A2:G2');
      const titleCell2 = worksheet.getCell('A2');
      titleCell2.value = 'Students : Active – Filtered List';
      titleCell2.font = { size: 20, bold: true, color: { argb: '2C2C2C' } };
      titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };

      // Adicionar data
      const dateCell = worksheet.getCell('H2');
      worksheet.mergeCells('H2:I2')
      dateCell.value = `Issued on: ${this.formatDate(new Date())}`;
      dateCell.font = { size: 12, bold: false, color: { argb: '2C2C2C' } };
      dateCell.alignment = { vertical: 'middle', horizontal: 'right' };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      FileSaver.saveAs(blob, 'ETC_filtered_students_active_data.xlsx');
      this.alert.show('Filtered data exported to Excel.', 'success');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      this.alert.show('Failed to export filtered data to Excel.', 'error');
    }
  }

  private async exportPdfAllDataTable(): Promise<void> {
    try {
      // 1. Fetch all trainer data
      const response = await lastValueFrom(this.financialService.getListAll());
      const students = Array.isArray(response) ? response : [response];

      if (!response) {
        this.alert.show('No data available for export.', 'warning');
        return;
      }

      // Preparar cabeçalhos
      const headers = [
        'Description',
        'P. Method',
        'Amount (MT)',
        'Last Update',
        'Status',
        'User'
      ];

      // 4. Mapear os dados para o formato da tabela
      const data = students.map(student => [
          student.description ?? '',
          student.method ?? '',
          student.amountMT ?? '',
          student.lastUpdate ?? '',
          student.status ?? '',
          student.trainerName ?? ''
      ]);

      // Cria o documento PDF
      //const doc = new jsPDF('landscape');
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // 4. Adicionar cabeçalho do documento
      doc.setFillColor('#fff');
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');

      // Carregar e adicionar imagem (logo)
      const logoUrl = 'images/marca.png'; // Caminho para sua imagem

      // Adicionar imagem (ajuste as coordenadas e tamanho conforme necessário)
      doc.addImage(logoUrl, 'PNG', 5, 5, 20, 20); // (imagem, formato, x, y, width, height)

      doc.setFontSize(22);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'bold');
      doc.text('ENGLISH TRAINING CENTER', 90, 15);

      doc.setFontSize(20);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'normal');
      doc.text('Students : Active – Full List', 100, 23);

      // 5. Adicionar data de emissão
      doc.setFontSize(10);
      doc.setTextColor(44, 44, 44);
      doc.text(`Issued on: ${this.formatDate(new Date())}`, 275, 23, { align: 'center' });

      // Gera a tabela no PDF
      autoTable(doc, {
        //valign: 'middle' // 'top' | 'middle' | 'bottom'
        head: [headers],
        body: data,
        margin: { top: 27, right: 5, left: 5 },

        tableWidth: 'auto', // ou 'auto' para ajuste automático

        columnStyles: {
          // Ajuste proporcional conforme suas colunas
          0: { cellWidth: 'auto', halign: 'center' },
          1: { cellWidth: 50, halign: 'left' },
          2: { cellWidth: 'auto', halign: 'center' },
          3: { cellWidth: 'auto', halign: 'center' },
          4: { cellWidth: 'auto', halign: 'center' },
          5: { cellWidth: 'auto', halign: 'center' },
          6: { cellWidth: 'auto', halign: 'center' },
          7: { cellWidth: 'auto', halign: 'center' },
          8: { cellWidth: 'auto', halign: 'center' }
        },

        headStyles: {
          fillColor: '#643887',
          halign: 'center',
          fontSize: 11
        },

        styles: {
          valign: 'middle',
          overflow: 'linebreak',
          fontSize: 9,
          cellPadding: 3
        },
      });

      const footerY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 0 + 15;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Desenhar linha separadora
      doc.setDrawColor(200);
      doc.line(20, footerY + 5, pageWidth - 20, footerY + 5);

      // Texto do footer
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(this.footer, pageWidth / 2, footerY + 10, { align: 'center' });

      // Salva o PDF
      doc.save('ETC_students_active_full_list_data.pdf');
      this.alert.show('All data exported to PDF.', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      this.alert.show('Failed to export all data to PDF.', 'error');
    }
  }

  private async exportPdfFilteredTable(): Promise<void> {
    try {
      if (!this.gridApi) {
        throw new Error('Grid uninitialized.');
      }

      // 1. Obter dados VISÍVEIS do grid (com filtros aplicados)
      const rowData: any[] = [];
      this.gridApi.forEachNodeAfterFilter(node => {
        if (node.data) {
          rowData.push(node.data);
        }
      });

      if (!rowData.length) {
        this.alert.show('No data available for export.', 'warning');
        return;
      }

      // Preparar cabeçalhos
      const headers = [
        'Code',
        'Full Name',
        'Gender',
        'Age',
        'Package',
        'Level',
        'Modality',
        'Period',
        'Schedule'
      ];

      // 4. Mapear os dados para o formato da tabela
      const data = rowData.map(student => [
          student.id ?? '',
          student.fullName ?? '',
          student.gender ?? '',
          student.age ?? '',
          student.package ?? '',
          student.level ?? '',
          student.modality ?? '',
          student.academicPeriod ?? '',
          student.schedule ?? ''
      ]);

      // Cria o documento PDF
      //const doc = new jsPDF('landscape');
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // 4. Adicionar cabeçalho do documento
      doc.setFillColor('#fff');
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');

      // Carregar e adicionar imagem (logo)
      const logoUrl = 'images/marca.png'; // Caminho para sua imagem

      // Adicionar imagem (ajuste as coordenadas e tamanho conforme necessário)
      doc.addImage(logoUrl, 'PNG', 5, 5, 20, 20); // (imagem, formato, x, y, width, height)

      doc.setFontSize(22);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'bold');
      doc.text('ENGLISH TRAINING CENTER', 90, 15);

      doc.setFontSize(20);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'normal');
      doc.text('Students : Active – Filtered List', 100, 23);

      // 5. Adicionar data de emissão
      doc.setFontSize(10);
      doc.setTextColor(44, 44, 44);
      doc.text(`Issued on: ${this.formatDate(new Date())}`, 275, 23, { align: 'center' });

      // Gera a tabela no PDF
      autoTable(doc, {
        //valign: 'middle' // 'top' | 'middle' | 'bottom'
        head: [headers],
        body: data,
        margin: { top: 27, right: 5, left: 5 },

        tableWidth: 'auto', // ou 'auto' para ajuste automático

        columnStyles: {
          0: { cellWidth: 'auto', halign: 'center' },
          1: { cellWidth: 50, halign: 'left' },
          2: { cellWidth: 'auto', halign: 'center' },
          3: { cellWidth: 'auto', halign: 'center' },
          4: { cellWidth: 'auto', halign: 'center' },
          5: { cellWidth: 'auto', halign: 'center' },
          6: { cellWidth: 'auto', halign: 'center' },
          7: { cellWidth: 'auto', halign: 'center' },
          8: { cellWidth: 'auto', halign: 'center' }
        },

        headStyles: {
          fillColor: '#643887',
          halign: 'center',
          fontSize: 11
        },

        styles: {
          valign: 'middle',
          overflow: 'linebreak',
          fontSize: 9,
          cellPadding: 3
        },
      });

      const footerY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 0 + 15;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Desenhar linha separadora
      doc.setDrawColor(200);
      doc.line(20, footerY + 5, pageWidth - 20, footerY + 5);

      // Texto do footer
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(this.footer, pageWidth / 2, footerY + 10, { align: 'center' });

      // Salva o PDF
      doc.save('ETC_filtered_student_active.pdf');
      this.alert.show('Filtered data exported to PDF.', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      this.alert.show('Failed to export filtered data to PDF.', 'error');
    }
  }

  private async printAllDataTable(): Promise<void> {
    try {
      // 1. Fetch all trainer data
      const response = await lastValueFrom(this.financialService.getListAll());
      const students = Array.isArray(response) ? response : [response];

      if (!response) {
        this.alert.show('Could not print all data.', 'warning');
        return;
      }

      // Preparar cabeçalhos
      const headers = [
        'Code',
        'Full Name',
        'Gender',
        'Age',
        'Package',
        'Level',
        'Modality',
        'Period',
        'Schedule'
      ];

      // 4. Mapear os dados para o formato da tabela
      const data = students.map(student => [
          student.id ?? '',
          student.fullName ?? '',
          student.gender ?? '',
          student.age ?? '',
          student.package ?? '',
          student.level ?? '',
          student.modality ?? '',
          student.academicPeriod ?? '',
          student.schedule ?? ''
      ]);

      // Cria o documento PDF
      //const doc = new jsPDF('landscape');
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // 4. Adicionar cabeçalho do documento
      doc.setFillColor('#fff');
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');

      // Carregar e adicionar imagem (logo)
      const logoUrl = 'images/marca.png'; // Caminho para sua imagem

      // Adicionar imagem (ajuste as coordenadas e tamanho conforme necessário)
      doc.addImage(logoUrl, 'PNG', 5, 5, 20, 20); // (imagem, formato, x, y, width, height)

      doc.setFontSize(22);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'bold');
      doc.text('ENGLISH TRAINING CENTER', 90, 15);

      doc.setFontSize(20);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'normal');
      doc.text('Students : Active – Full List', 100, 23);

      // 5. Adicionar data de emissão
      doc.setFontSize(10);
      doc.setTextColor(44, 44, 44);
      doc.text(`Issued on: ${this.formatDate(new Date())}`, 275, 23, { align: 'center' });

      // Gera a tabela no PDF
      autoTable(doc, {
        //valign: 'middle' // 'top' | 'middle' | 'bottom'
        head: [headers],
        body: data,
        margin: { top: 27, right: 5, left: 5 },

        tableWidth: 'auto', // ou 'auto' para ajuste automático

        columnStyles: {
          0: { cellWidth: 'auto', halign: 'center' },
          1: { cellWidth: 50, halign: 'left' },
          2: { cellWidth: 'auto', halign: 'center' },
          3: { cellWidth: 'auto', halign: 'center' },
          4: { cellWidth: 'auto', halign: 'center' },
          5: { cellWidth: 'auto', halign: 'center' },
          6: { cellWidth: 'auto', halign: 'center' },
          7: { cellWidth: 'auto', halign: 'center' },
          8: { cellWidth: 'auto', halign: 'center' }
        },

        headStyles: {
          fillColor: '#643887',
          halign: 'center',
          fontSize: 11
        },

        styles: {
          valign: 'middle',
          overflow: 'linebreak',
          fontSize: 9,
          cellPadding: 3
        },
      });

      const footerY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 0 + 15;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Desenhar linha separadora
      doc.setDrawColor(200);
      doc.line(20, footerY + 5, pageWidth - 20, footerY + 5);

      // Texto do footer
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(this.footer, pageWidth / 2, footerY + 10, { align: 'center' });

      // Abre uma nova janela para impressão
      const pdfBlob = doc.output('blob');

      // Opção 1: Imprimir diretamente com Print.js
      // npm install print-js --save
      const pdfUrl = URL.createObjectURL(pdfBlob);
      printJS({
        printable: pdfUrl,
        type: 'pdf',
        onLoadingEnd: () => {
          URL.revokeObjectURL(pdfUrl); // Limpeza de memória
          this.alert.show('Printing started for all data.', 'info');
        },
        onError: () => {
         // console.error('PrintJS error:', error);
          this.alert.show('Oops! Direct printing failed.', 'error');
          // Fallback para download
          doc.save('ETC_students_active_full_list_data.pdf');
        }
      });
    } catch (error) {
      console.error('Failed to start printing all data:', error);
      this.alert.show('Failed to start printing all data.', 'error');
    }
  }

  private async printFilteredTable(): Promise<void> {
    try {
      if (!this.gridApi) {
        throw new Error('Grid uninitialized.');
      }

      // 1. Obter dados VISÍVEIS do grid (com filtros aplicados)
      const rowData: any[] = [];
      this.gridApi.forEachNodeAfterFilter(node => {
        if (node.data) {
          rowData.push(node.data);
        }
      });

      if (!rowData.length) {
        this.alert.show('No filtered data to print.', 'warning');
        return;
      }

      if (!rowData.length) {
        this.alert.show('No data available for export.', 'warning');
        return;
      }

      // Preparar cabeçalhos
      const headers = [
        'Code',
        'Full Name',
        'Gender',
        'Age',
        'Package',
        'Level',
        'Modality',
        'Period',
        'Schedule'
      ];

      // 4. Mapear os dados para o formato da tabela
      const data = rowData.map(student => [
          student.id ?? '',
          student.fullName ?? '',
          student.gender ?? '',
          student.age ?? '',
          student.package ?? '',
          student.level ?? '',
          student.modality ?? '',
          student.academicPeriod ?? '',
          student.schedule ?? ''
      ]);

      // Cria o documento PDF
      //const doc = new jsPDF('landscape');
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // 4. Adicionar cabeçalho do documento
      doc.setFillColor('#fff');
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');

      // Carregar e adicionar imagem (logo)
      const logoUrl = 'images/marca.png'; // Caminho para sua imagem

      // Adicionar imagem (ajuste as coordenadas e tamanho conforme necessário)
      doc.addImage(logoUrl, 'PNG', 5, 5, 20, 20); // (imagem, formato, x, y, width, height)

      doc.setFontSize(22);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'bold');
      doc.text('ENGLISH TRAINING CENTER', 90, 15);

      doc.setFontSize(20);
      doc.setTextColor(44, 44, 44);
      doc.setFont('helvetica', 'normal');
      doc.text('Students : Active – Filtered List', 100, 23);

      // 5. Adicionar data de emissão
      doc.setFontSize(10);
      doc.setTextColor(44, 44, 44);
      doc.text(`Issued on: ${this.formatDate(new Date())}`, 275, 23, { align: 'center' });

      // Gera a tabela no PDF
      autoTable(doc, {
        //valign: 'middle' // 'top' | 'middle' | 'bottom'
        head: [headers],
        body: data,
        margin: { top: 27, right: 5, left: 5 },

        tableWidth: 'auto', // ou 'auto' para ajuste automático

        columnStyles: {
          0: { cellWidth: 'auto', halign: 'center' },
          1: { cellWidth: 50, halign: 'left' },
          2: { cellWidth: 'auto', halign: 'center' },
          3: { cellWidth: 'auto', halign: 'center' },
          4: { cellWidth: 'auto', halign: 'center' },
          5: { cellWidth: 'auto', halign: 'center' },
          6: { cellWidth: 'auto', halign: 'center' },
          7: { cellWidth: 'auto', halign: 'center' },
          8: { cellWidth: 'auto', halign: 'center' }
        },

        headStyles: {
          fillColor: '#643887',
          halign: 'center',
          fontSize: 11
        },

        styles: {
          valign: 'middle',
          overflow: 'linebreak',
          fontSize: 9,
          cellPadding: 3
        },
      });

      const footerY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 0 + 15;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Desenhar linha separadora
      doc.setDrawColor(200);
      doc.line(20, footerY + 5, pageWidth - 20, footerY + 5);

      // Texto do footer
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(this.footer, pageWidth / 2, footerY + 10, { align: 'center' });

      // Abre uma nova janela para impressão
      const pdfBlob = doc.output('blob');

      // Opção 1: Imprimir diretamente com Print.js
      // npm install print-js --save
      const pdfUrl = URL.createObjectURL(pdfBlob);
      printJS({
        printable: pdfUrl,
        type: 'pdf',
        onLoadingEnd: () => {
          URL.revokeObjectURL(pdfUrl); // Limpeza de memória
          this.alert.show('Printing started for filtered data.', 'info');
        },
        onError: () => {
         // console.error('PrintJS error:', error);
          this.alert.show('Oops! Direct printing failed.', 'error');
          // Fallback para download
          doc.save('ETC_list_of_student_active_filtered_data.pdf');
        }
      });
    } catch (error) {
      console.error('Failed to start printing filtered data:', error);
      this.alert.show('Failed to start printing filtered data.', 'error');
    }
  }

  private handleExportError(error: unknown, format: string): void {
    console.error(`Export error (${format}):`, error);

    const errorMessages = {
      copy: 'Copy to clipboard failed.',
      excel: 'Export to Excel failed.',
      pdf: 'PDF generation failed.',
      print: 'Print setup failed.'
    };

    this.alert.show(errorMessages[format as keyof typeof errorMessages], 'error');
  }
}
