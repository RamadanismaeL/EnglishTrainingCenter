import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { StudentCourseInfoService } from '../../../_services/student-course-info.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackBarService } from '../../../_services/snack-bar.service';

@Component({
  selector: 'app-dialog-manage-evalutions-edit-grade-table',
  imports: [
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './dialog-manage-evalutions-edit-grade-table.component.html',
  styleUrl: './dialog-manage-evalutions-edit-grade-table.component.scss'
})
export class DialogManageEvalutionsEditGradeTableComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  form! : FormGroup;
  previousAmountValue: string = '';
  private subs: Subscription = new Subscription();

  constructor(public dialogRef : MatDialogRef<DialogManageEvalutionsEditGradeTableComponent>, @Inject(MAT_DIALOG_DATA) public data:
    {
      studentName: string,
      order: number,
      quizOne: number,
      quizTwo: number
    },
  private studentCourseInfo: StudentCourseInfoService,
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
      quizOne : [''],
      quizTwo : ['']
    });

    if (this.data)
    {
      this.form.patchValue({
        quizOne: this.data.quizOne,
        quizTwo: this.data.quizTwo
      });
    }
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

  onCancel()
  {
    this.dialogRef.close(false);
  }

  onSave()
  {
    if (this.form.valid)
    {
      const formDataToSend = {
        order: this.data.order,
        quizOne: this.form.value.quizOne,
        quizTwo: this.form.value.quizTwo
      };

      this.subs.add(
        this.studentCourseInfo.updateQuizOneTwo(formDataToSend).subscribe({
          next: () => {
            //console.log('Resposta do servidor:', response);
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.handleError(error);
            this.dialogRef.close(false);
          }
        })
      );
    }
    else
    {
      this.dialogRef.close(false);
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
