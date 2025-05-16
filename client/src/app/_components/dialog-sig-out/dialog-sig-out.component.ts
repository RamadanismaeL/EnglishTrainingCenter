import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-sig-out',
  templateUrl: './dialog-sig-out.component.html',
  styleUrl: './dialog-sig-out.component.scss'
})
export class DialogSigOutComponent {
  constructor(public dialogRef : MatDialogRef<DialogSigOutComponent>)
  {}

  onCancel() : void {
    this.dialogRef.close(false);
  }

  onConfirm() : void {
    this.dialogRef.close(true);
  }
}
