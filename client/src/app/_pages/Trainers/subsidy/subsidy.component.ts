import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry, ColDef, GridApi, GridReadyEvent, RowSelectionOptions } from 'ag-grid-community';
import { TrainersService } from '../../../_services/trainers.service';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NotificationHubService } from '../../../_services/notification-hub.service';
import { Subscription } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { lastValueFrom } from 'rxjs';
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import printJS from 'print-js';
import { MatSelectModule } from '@angular/material/select';
import { BtnTrainerSubsidyActionsTableComponent } from '../../../_components/trainers/btn-trainer-subsidy-actions-table/btn-trainer-subsidy-actions-table.component';

ModuleRegistry.registerModules([ AllCommunityModule]);

@Component({
  selector: 'app-subsidy',
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
    MatListModule
],
  templateUrl: './subsidy.component.html',
  styleUrl: './subsidy.component.scss'
})
export class SubsidyComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[1]);
  positionT = new FormControl(this.positionOptions[0]);

  columnDefs: ColDef[] =
  [
    {
      field: 'profileImage',
      headerName: 'Photo',
      cellRenderer: (params: any) => {
        const imageUrl = params.value;
        const fullName = params.data?.fullName || '';
        const initial = fullName.charAt(0).toUpperCase();

        if (imageUrl) {
          return `<img src="${imageUrl}" alt="profile" style="height: 40px; width: 40px; border-radius: 50%;" />`;
        } else {
          return `
            <div style="
              background-color: #536DFE;
              color: white;
              font-size: 18px;
              font-weight: 500;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            ">
              ${initial}
            </div>`;
        }
      },
      minWidth: 90,
      flex: 1,
      cellClass: 'custom-cell-center'
    },
    {
      headerName: 'Full Name',
      field: 'fullName', minWidth: 280, flex: 1,
      cellClass: 'custom-cell-start'
    },
    {
      headerName: 'Position',
      field: 'position', minWidth: 250, flex: 1,
      cellClass: 'custom-cell-start'
    },
    {
      headerName: 'Status',
      field: 'status', minWidth: 80, flex: 1,
      cellClass: 'custom-cell-center',
      cellRenderer: (params: any) => {
        return params.value === 0
          ? '<span style="color: red;">Inactive</span>'
          : '<span style="color: green;">Active</span>';
      }
    },
    {
      headerName: 'Subsidy (MT)',
      field: 'subsidyMTFormatted', minWidth: 150, flex: 1,
      cellClass: 'custom-cell-end',
      //aggFunc: 'sum'
    },
    {
      headerName: 'Last Update',
      field: 'dateUpdate', minWidth: 180, flex: 1,
      cellClass: 'custom-cell-center'
    },
    {
      field: 'Actions',
      headerName: 'Actions',
      minWidth: 110, flex: 1,
      cellRenderer: BtnTrainerSubsidyActionsTableComponent,
      cellClass: 'custom-cell-center'
    }
  ];
  //grandTotalRow: "top" | "bottom" = "bottom";

  rowData: any[] = [];
  filteredData: any[] = [];
  searchText: string = '';
  pageSize: number = 4;
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

  private currentYear = new Date().getFullYear();
  private author = "Ramadan IsmaeL";
  //private country = "Mozambique";
  private institution = "English Training Center";

  //private footer = `Generated for ${this.institution} · Made in ${this.country} by ${this.author} · © ${this.currentYear} · All rights reserved.`;
  private footer = `© ${this.currentYear} | ${this.author} · License: ${this.institution} · All rights reserved.`;

  constructor(private trainerService: TrainersService, private notificationHub: NotificationHubService, private alert: SnackBarService, private clipboard: Clipboard)
  {}

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
      const response = await lastValueFrom(this.trainerService.detailsSubsidy());
      const trainers = Array.isArray(response) ? response : [response];

      if (!trainers.length) {
        this.alert.show('No data available.', 'warning');
        return;
      }

      const ignoreKeys = ['subsidyMT'];
      const orderedKeys = ['profileImage', 'fullName', 'position', 'status', 'subsidyMTFormatted', 'dateUpdate']; // ordem desejada

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
      const response = await lastValueFrom(this.trainerService.detailsSubsidy());

      // Validate response
      if (!response) {
        this.alert.show('No data available for export.', 'warning');
        return;
      }

       // 2. Ensure data is an array
      const trainers = Array.isArray(response) ? response : [response];

      //console.log('Exporting:', trainers);

      // 4. Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Trainers');

      const excelColumns = [
        { header: 'Photo', key: 'profileImage', width: 45 },
        { header: 'Full Name', key: 'fullName', width: 40 },
        { header: 'Position', key: 'position', width: 40 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Subsidy (MT)', key: 'subsidyMTFormatted', width: 20 },
        { header: 'Date Update', key: 'dateUpdate', width: 25 }
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
      trainers.forEach((trainer, index) => {
        const rowNumber = index + 5; // Começa da linha 5
        worksheet.getRow(rowNumber).values = [
          trainer.profileImage ?? '',
          trainer.fullName ?? '',
          trainer.position ?? '',
          trainer.status ?? '',
          trainer.subsidyMTFormatted ?? '',
          trainer.dateUpdate ?? ''
        ];
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 4) { // Ignora o cabeçalho (linha 1)
          worksheet.getRow(rowNumber).height = 20;

          row.eachCell({ includeEmpty: true }, cell => {
            // Estilo padrão para todas as células de dados
            cell.font = { size: 12, bold: false, color: { argb: 'FF000000' } }; // Preto
            cell.alignment = { vertical: 'middle', horizontal: 'left' };

            const columnLetter = worksheet.getColumn(cell.col).letter;

            if (['D', 'E', 'F'].includes(columnLetter)) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }

            if (['E'].includes(columnLetter)) {
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

      // 1. Função auxiliar para converter imagem em base64 (adicione ao seu serviço)
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
      const lastRow = worksheet.lastRow?.number;
      const calc = lastRow! + 2;
      console.log('LastRow + 2 = ', calc)

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
      titleCell2.value = 'Trainer Subsidies – Full List';
      titleCell2.font = { size: 20, bold: true, color: { argb: '2C2C2C' } };
      titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };

      // Adicionar data
      const dateCell = worksheet.getCell('F2');
      dateCell.value = `Issued on: ${this.formatDate(new Date())}`;
      dateCell.font = { size: 12, bold: false, color: { argb: '2C2C2C' } };
      dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      FileSaver.saveAs(blob, 'ETC_trainer_subsidies_full_list_data.xlsx');
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
      const rowData: any[] = [];
      this.gridApi.forEachNodeAfterFilter(node => {
        if (node.data) {
          rowData.push(node.data);
        }
      });

      // Alternativa para dados SELECIONADOS:
      // const rowData = this.gridApi.getSelectedRows();

      if (!rowData.length) {
        this.alert.show('No data available for export.', 'warning');
        return;
      }

      // 2. Criar workbook Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Trainers');

      const excelColumns = [
        { header: 'Photo', key: 'profileImage', width: 45 },
        { header: 'Full Name', key: 'fullName', width: 40 },
        { header: 'Position', key: 'position', width: 40 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Subsidy (MT)', key: 'subsidyMTFormatted', width: 20 },
        { header: 'Date Update', key: 'dateUpdate', width: 25 }
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

      // Adicionar dados
      rowData.forEach((trainer, index) => {
        const rowNumber = index + 5; // Começa da linha 5
        worksheet.getRow(rowNumber).values = [
          trainer.profileImage ?? '',
          trainer.fullName ?? '',
          trainer.position ?? '',
          trainer.status ?? '',
          trainer.subsidyMTFormatted ?? '',
          trainer.dateUpdate ?? ''
        ];
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 4) { // Ignora o cabeçalho (linha 1)
          worksheet.getRow(rowNumber).height = 20;

          row.eachCell({ includeEmpty: true }, cell => {
            // Estilo padrão para todas as células de dados
            cell.font = { size: 12, bold: false, color: { argb: 'FF000000' } }; // Preto
            cell.alignment = { vertical: 'middle', horizontal: 'left' };

            const columnLetter = worksheet.getColumn(cell.col).letter;

            if (['D', 'E', 'F'].includes(columnLetter)) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }

            if (['E'].includes(columnLetter)) {
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

      // 1. Função auxiliar para converter imagem em base64 (adicione ao seu serviço)
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
      titleCell2.value = 'Filtered Trainer Subsidies';
      titleCell2.font = { size: 20, bold: true, color: { argb: '2C2C2C' } };
      titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };

      // Adicionar data
      const dateCell = worksheet.getCell('F2');
      dateCell.value = `Issued on: ${this.formatDate(new Date())}`;
      dateCell.font = { size: 12, bold: false, color: { argb: '2C2C2C' } };
      dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      FileSaver.saveAs(blob, 'ETC_filtered_trainer_subsidies_data.xlsx');
      this.alert.show('Filtered data exported to Excel.', 'success');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      this.alert.show('Failed to export filtered data to Excel.', 'error');
    }
  }

  private async exportPdfAllDataTable(): Promise<void> {
    try {
      // 1. Fetch all trainer data
      const response = await lastValueFrom(this.trainerService.detailsSubsidy());
      const trainers = Array.isArray(response) ? response : [response];

      if (!response) {
        this.alert.show('No data available for export.', 'warning');
        return;
      }

      // Preparar cabeçalhos
      const headers = [
        'Photo',
        'Full Name',
        'Position',
        'Status',
        'Subsidy (MT)',
        'Date Update'
      ];

      // 4. Mapear os dados para o formato da tabela
      const data = trainers.map(trainer => [
          trainer.profileImage ?? '',
          trainer.fullName ?? '',
          trainer.position ?? '',
          trainer.status ?? '',
          trainer.subsidyMTFormatted ?? '',
          trainer.dateUpdate ?? ''
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
      doc.text('Trainer Subsidies – Full List', 100, 23);

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
          0: { cellWidth: 50, halign: 'left' },
          1: { cellWidth: 50, halign: 'left' },
          2: { cellWidth: 'auto', halign: 'left' },
          3: { cellWidth: 'auto', halign: 'center' },
          4: { cellWidth: 'auto', halign: 'right' },
          5: { cellWidth: 'auto', halign: 'center' }
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
      doc.save('ETC_trainer_subsidies_full_list_data.pdf');
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

      // Alternativa para dados SELECIONADOS:
      // const rowData = this.gridApi.getSelectedRows();

      if (!rowData.length) {
        this.alert.show('No data available for export.', 'warning');
        return;
      }

      // Preparar cabeçalhos
      const headers = [
        'Photo',
        'Full Name',
        'Position',
        'Status',
        'Subsidy (MT)',
        'Date Update'
      ];

      // 4. Mapear os dados para o formato da tabela
      const data = rowData.map(trainer => [
          trainer.profileImage ?? '',
          trainer.fullName ?? '',
          trainer.position ?? '',
          trainer.status ?? '',
          trainer.subsidyMTFormatted ?? '',
          trainer.dateUpdate ?? ''
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
      doc.text('Filtered Trainer Subsidies', 105, 23);

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
          0: { cellWidth: 50, halign: 'left' },
          1: { cellWidth: 50, halign: 'left' },
          2: { cellWidth: 'auto', halign: 'left' },
          3: { cellWidth: 'auto', halign: 'center' },
          4: { cellWidth: 'auto', halign: 'right' },
          5: { cellWidth: 'auto', halign: 'center' }
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
      doc.save('ETC_filtered_trainer_subsidies.pdf');
      this.alert.show('Filtered data exported to PDF.', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      this.alert.show('Failed to export filtered data to PDF.', 'error');
    }
  }

  private async printAllDataTable(): Promise<void> {
    try {
      // 1. Fetch all trainer data
      const response = await lastValueFrom(this.trainerService.detailsSubsidy());
      const trainers = Array.isArray(response) ? response : [response];

      if (!response) {
        this.alert.show('Could not print all data.', 'warning');
        return;
      }

      // Preparar cabeçalhos
      const headers = [
        'Photo',
        'Full Name',
        'Position',
        'Status',
        'Subsidy (MT)',
        'Date Update'
      ];

      // 4. Mapear os dados para o formato da tabela
      const data = trainers.map(trainer => [
          trainer.profileImage ?? '',
          trainer.fullName ?? '',
          trainer.position ?? '',
          trainer.status ?? '',
          trainer.subsidyMTFormatted ?? '',
          trainer.dateUpdate ?? ''
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
      doc.text('Trainer Subsidies – Full List', 100, 23);

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
          0: { cellWidth: 50, halign: 'left' },
          1: { cellWidth: 50, halign: 'left' },
          2: { cellWidth: 'auto', halign: 'left' },
          3: { cellWidth: 'auto', halign: 'center' },
          4: { cellWidth: 'auto', halign: 'right' },
          5: { cellWidth: 'auto', halign: 'center' }
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
          doc.save('ETC_trainer_subsidies_full_list_data.pdf');
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
        'Photo',
        'Full Name',
        'Position',
        'Status',
        'Subsidy (MT)',
        'Date Update'
      ];

      // 4. Mapear os dados para o formato da tabela
      const data = rowData.map(trainer => [
          trainer.profileImage ?? '',
          trainer.fullName ?? '',
          trainer.position ?? '',
          trainer.status ?? '',
          trainer.subsidyMTFormatted ?? '',
          trainer.dateUpdate ?? ''
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
      doc.text('Filtered Trainer Subsidies', 105, 23);

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
          0: { cellWidth: 50, halign: 'left' },
          1: { cellWidth: 50, halign: 'left' },
          2: { cellWidth: 'auto', halign: 'left' },
          3: { cellWidth: 'auto', halign: 'center' },
          4: { cellWidth: 'auto', halign: 'right' },
          5: { cellWidth: 'auto', halign: 'center' }
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
          doc.save('ETC_list_of_trainers_filtered_data.pdf');
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
