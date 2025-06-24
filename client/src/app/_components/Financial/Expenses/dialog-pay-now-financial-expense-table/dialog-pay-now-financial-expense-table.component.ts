import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FinancialService } from '../../../../_services/financial.service';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { MatSelectModule } from '@angular/material/select';
import { ListFinancialExpenseCreateDto } from '../../../../_interfaces/list-financial-expense-create-dto';

@Component({
  selector: 'app-dialog-pay-now-financial-expense-table',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './dialog-pay-now-financial-expense-table.component.html',
  styleUrl: './dialog-pay-now-financial-expense-table.component.scss'
})
export class DialogPayNowFinancialExpenseTableComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  form! : FormGroup;
  previousAmountValue: string = '';
  private subs: Subscription = new Subscription();
  private financialCreate = {} as ListFinancialExpenseCreateDto;

  constructor(public dialogRef : MatDialogRef<DialogPayNowFinancialExpenseTableComponent>, @Inject(MAT_DIALOG_DATA) public data:
    {
      id: number,
      description: string,
      amountMT: number
    },
  private financialService: FinancialService,
  private alert: SnackBarService
  )
  {
    //console.log('Dados recebidos: ',data)
  }

  ngOnInit(): void {
      this.initializeForm();
  }

  ngOnDestroy(): void {
    //throw new Error('Method not implemented.');
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      payoutMethod : ['', [Validators.required, Validators.nullValidator]]
    });
  }

  onAmount(event: any) {
    const input = event.target;
    let value = input.value;

    // Permite dígitos e vírgula (mas não permite vírgula no início sozinha)
    const numericValue = value.replace(/[^\d,]/g, '');

    // Se for apenas uma vírgula, não faz nada (aguarda dígitos)
    if (numericValue === ',') {
      return;
    }

    // Se após limpeza estiver vazio, define como vazio
    if (numericValue === '') {
      input.value = '';
      return;
    }

    // Converte para número e verifica o valor máximo
    const numberValue = this.parseNumber(numericValue);
    if (numberValue > 100) {
      input.value = this.previousAmountValue || '';
    } else {
      input.value = this.formatNumber(numericValue);
      this.previousAmountValue = input.value;
    }
  }

  private formatNumber(value: string): string {
      // Processamento normal para valores completos
      let [integerPart, decimalPart] = value.split(',');

      // Processa parte decimal (se existir)
      if (decimalPart !== undefined) {
          decimalPart = decimalPart.replace(/\D/g, '').substring(0, 2);
          return integerPart + ',' + decimalPart;
      }

      return integerPart;
  }

  private parseNumber(formattedValue: string): number {
      // Converte "1.234,56" para 1234.56
      const numberString = formattedValue.replace(/\./g, '').replace(',', '.');
      return parseFloat(numberString) || 0;
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  onCancel()
  {
    this.dialogRef.close(false);
  }

  onSave()
  {
    var amount = this.parseNumber(this.data.amountMT.toString())
    if (this.form.valid)
    {
      this.financialCreate = {
        description: this.data.description,
        method: this.form.value.payoutMethod,
        amountMT: amount
      }
      console.log("Add = ",this.financialCreate)
      this.subs.add(
        this.financialService.create(this.financialCreate).subscribe({
          next: (response) => {
            this.alert.show(response.message, 'success');
            this.dialogRef.close(true);
          },
          error: (error: HttpErrorResponse) => {
            this.handleError(error);
            this.dialogRef.close(false);
          }
        })
      );

      /*this.subs.add(
        this.financialService.updateStatusPaid(this.data.id, this.form.value.payoutMethod).subscribe({
          next: (response) => {
            this.alert.show(response.message, 'success');
            this.dialogRef.close(true);
          },
          error: (error: HttpErrorResponse) => {
            this.handleError(error);
            this.dialogRef.close(false);
          }
        })
      );*/
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 400) {
      this.alert.show('An error occurred.', 'error');
    } else if (error.status === 401) {
      this.alert.show('Oops! Unauthorized!', 'error');
    } else if (error.status === 404) {
      this.alert.show('Oops! Not found!', 'error');
    } else if (error.status >= 500) {
      this.alert.show('Oops! The server is busy!', 'error');
    } else {
      this.alert.show('Oops! An unexpected error occurred.', 'error');
    }
  }
}
