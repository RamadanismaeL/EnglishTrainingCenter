import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialog-schedule-exams',
  imports: [
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './dialog-schedule-exams.component.html',
  styleUrl: './dialog-schedule-exams.component.scss'
})
export class DialogScheduleExamsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  form! : FormGroup;
  previousAmountValue: string = '';

  constructor(public dialogRef : MatDialogRef<DialogScheduleExamsComponent>)
  {
    //console.log('Dados recebidos: ',data)
  }

  ngOnInit(): void {
      this.initializeForm();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      exam : ['']
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
    if (numberValue > 101) {
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

  onCancel()
  {
    this.dialogRef.close(false);
  }

  onSave()
  {}
}
