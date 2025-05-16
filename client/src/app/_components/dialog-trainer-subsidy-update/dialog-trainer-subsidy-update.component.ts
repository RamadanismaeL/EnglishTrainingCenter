import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { SnackBarService } from '../../_services/snack-bar.service';
import { TrainersService } from '../../_services/trainers.service';
import { DialogTrainerUpdateComponent } from '../dialog-trainer-update/dialog-trainer-update.component';
import { TrainerUpdateSubsidyDto } from '../../_interfaces/trainer-update-subsidy-dto';

@Component({
  selector: 'app-dialog-trainer-subsidy-update',
  imports: [
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './dialog-trainer-subsidy-update.component.html',
  styleUrl: './dialog-trainer-subsidy-update.component.scss'
})
export class DialogTrainerSubsidyUpdateComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);

  private readonly fb = inject(FormBuilder);
  private readonly trainerService = inject(TrainersService);
  private readonly alert = inject(SnackBarService);

  form! : FormGroup;
  urlImage: string | ArrayBuffer | null = null;
  checkurlImage : boolean = false;
  private subs: Subscription = new Subscription();
  private trainerSubsidyDto = {} as TrainerUpdateSubsidyDto;
  previousAmountValue: string = '';

  private _fullName = signal('');
  public initialLetter = computed(() =>
    this._fullName().trim() ? this._fullName().trim()[0].toUpperCase() : ''
  );

  constructor(public dialogRef : MatDialogRef<DialogTrainerUpdateComponent>, @Inject(MAT_DIALOG_DATA) public data: {
    id: string,
    profileImage: string,
    fullName: string,
    position: string,
    subsidy: number })
  {
    //console.log('Dados recebidos: ',data)
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadDetails();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      subsidy : ['', [Validators.required, Validators.nullValidator]]
    });

    if (this.data)
      {
        this.form.patchValue
        ({
          subsidy : this.data.subsidy
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
    if (numberValue > 10000000) {
      input.value = this.previousAmountValue || '';
    } else {
      input.value = this.formatNumber(numericValue);
      this.previousAmountValue = input.value;
    }
  }

  formatNumber(value: string): string {
      // Caso especial: quando o usuário está digitando um decimal (ex: "0," ou "123,")
      if (value.endsWith(',')) {
          let integerPart = value.replace(/\D/g, '');
          integerPart = integerPart.replace(/^0+/, '') || '0';
          integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          return integerPart + ',';
      }

      // Processamento normal para valores completos
      let [integerPart, decimalPart] = value.split(',');

      // Limpa parte inteira
      integerPart = integerPart.replace(/\D/g, '');
      integerPart = integerPart.replace(/^0+/, '') || '0';
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      // Processa parte decimal (se existir)
      if (decimalPart !== undefined) {
          decimalPart = decimalPart.replace(/\D/g, '').substring(0, 2);
          return integerPart + ',' + decimalPart;
      }

      return integerPart;
  }

  parseNumber(formattedValue: string): number {
      // Converte "1.234,56" para 1234.56
      const numberString = formattedValue.replace(/\./g, '').replace(',', '.');
      return parseFloat(numberString) || 0;
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  loadDetails() {
    if (this.data.profileImage)
    {
      this.checkurlImage = true;
      this.urlImage = this.data.profileImage;
    }
    else
    {
      this.checkurlImage = false;
      this.urlImage;
    }
    this._fullName.set(this.data.fullName);
  }

  onCancel()
  {
    this.dialogRef.close(false);
  }

  update() {
    if (this.form.valid)
    {
      this.trainerSubsidyDto.id = this.data.id;

      const decimalValue = this.parseNumber(this.form.value.subsidy);

      this.trainerSubsidyDto.subsidyMT = decimalValue;
      //console.log("Datas: ",this.form.value)

      // Chamada do serviço
      const updateSub = this.trainerService.updateSubsidy(this.trainerSubsidyDto).subscribe({
        next: () => {
          this.resetForm();
          this.alert.show('Trainer updated successfully!', 'success');
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
              this.alert.show('An error occurred while updating.', 'error');
          } else if (error.status === 401) {
              this.alert.show('Oops! Unauthorized!', 'error');
          } else if (error.status === 404) {
              this.alert.show('Oops! Not found!', 'error');
          } else if (error.status >= 500) {
              this.alert.show('Oops! The server is busy!', 'error');
          } else {
              this.alert.show('Oops! An unexpected error occurred.', 'error');
          }
          this.dialogRef.close(false);
        }
      });
      this.subs.add(updateSub);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private resetForm() {
    this.form.reset();

    // Limpa as validações e erros de forma eficiente
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.clearValidators(); // Limpa as validações
        control.setErrors(null); // Limpa os erros
        control.updateValueAndValidity(); // Atualiza o estado de validade
      }
    });
  }
}

