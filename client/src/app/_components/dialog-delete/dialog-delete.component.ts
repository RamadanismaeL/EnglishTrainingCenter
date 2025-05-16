import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-delete',
  imports: [
    MatDialogModule
  ],
  templateUrl: './dialog-delete.component.html',
  styleUrl: './dialog-delete.component.scss'
})
export class DialogDeleteComponent {
  constructor(public dialogRef : MatDialogRef<DialogDeleteComponent>, @Inject(MAT_DIALOG_DATA) public data: {fullName: string})
  {
    //console.log('Nome recebido: ', this.data.fullName)
  }

  onCancel() : void {
    this.dialogRef.close(false);
  }

  onConfirm() : void {
    this.dialogRef.close(true);
  }
}
