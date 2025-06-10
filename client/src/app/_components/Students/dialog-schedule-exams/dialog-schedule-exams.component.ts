import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { StudentCourseInfoService } from '../../../_services/student-course-info.service';
import { Subscription } from 'rxjs';

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
  private subs: Subscription = new Subscription();

  constructor(public dialogRef : MatDialogRef<DialogScheduleExamsComponent>, @Inject(MAT_DIALOG_DATA) public data:
      {
        studentName: string,
        id: string,
        exam: number,
      },
    private studentCourseInfo: StudentCourseInfoService,
    private alert: SnackBarService)
  {
    //console.log('Received datas: ',data)
  }

  ngOnInit(): void {
      this.initializeForm();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      exam : ['']
    });

    if (this.data)
    {
      this.form.patchValue({
        exam: this.data.exam
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
      this.subs.add(
        this.studentCourseInfo.updateSheduledExams(this.data.id, this.form.value.exam).subscribe({
          next: (response) => {
            this.alert.show(response.message, 'success');
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.alert.show(error.error.message, 'error');
          }
        })
      );
    }

    this.dialogRef.close(false);
  }
}
