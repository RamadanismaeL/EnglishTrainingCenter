import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { DialogTrainerSubsidyUpdateComponent } from '../../dialog-trainer-subsidy-update/dialog-trainer-subsidy-update.component';
import { FormControl } from '@angular/forms';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'app-btn-trainer-subsidy-actions-table',
  imports: [
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './btn-trainer-subsidy-actions-table.component.html',
  styleUrl: './btn-trainer-subsidy-actions-table.component.scss'
})
export class BtnTrainerSubsidyActionsTableComponent implements ICellRendererAngularComp, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  positionR = new FormControl(this.positionOptions[3]);

  params: any;
  private subs: Subscription = new Subscription();

  constructor (private dialog: MatDialog)
  {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onEdit() {
    //console.log('Editar:', this.params.data);
    this.dialog.open(DialogTrainerSubsidyUpdateComponent, {
      data:
      {
        id: this.params.data.id,
        profileImage: this.params.data.profileImage,
        fullName: this.params.data.fullName,
        position: this.params.data.position,
        subsidy: this.params.data.subsidyMTFormatted
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
