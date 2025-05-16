import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialog-share-enrollment',
  imports: [
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './dialog-share-enrollment.component.html',
  styleUrl: './dialog-share-enrollment.component.scss'
})
export class DialogShareEnrollmentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  form! : FormGroup;

  constructor(public dialogRef : MatDialogRef<DialogShareEnrollmentComponent>)
  {
    //console.log('Dados recebidos: ',data)
  }

  ngOnInit(): void {
      this.initializeForm();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      email : ['', [Validators.required, Validators.nullValidator, Validators.email]]
    });
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  onCancel()
  {
    this.dialogRef.close(false);
  }

  onSend()
  {}
}
