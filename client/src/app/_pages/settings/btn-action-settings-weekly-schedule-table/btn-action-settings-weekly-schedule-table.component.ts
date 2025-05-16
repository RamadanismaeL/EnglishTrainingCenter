import { Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { SettingService } from '../../../_services/setting.service';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-btn-action-settings-weekly-schedule-table',
  imports: [
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './btn-action-settings-weekly-schedule-table.component.html',
  styleUrl: './btn-action-settings-weekly-schedule-table.component.scss'
})
export class BtnActionSettingsWeeklyScheduleTableComponent implements ICellRendererAngularComp, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
    position = new FormControl(this.positionOptions[3]);

  params: any;
  private subs: Subscription = new Subscription();

  constructor (private settingService: SettingService, private alert: SnackBarService)
  {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onDelete()
  {
    const deleteSub = this.settingService.deleteWeeklySchedule(this.params.data.id).subscribe
    ({
      next: () => {
        this.alert.show('Weekly schedule has been successfully deleted!', 'success');
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
            this.alert.show('An error occurred while deleting.', 'error');
        } else if (error.status === 401) {
            this.alert.show('Oops! Unauthorized!', 'error');
        } else if (error.status === 403) {
            this.alert.show('Oops! Access denied. You do not have permission.', 'error');
        } else if (error.status === 404) {
          this.alert.show('Oops! Not found!', 'error');
        }  else if (error.status >= 500) {
            this.alert.show('Oops! The server is busy!', 'error');
        } else {
            this.alert.show('Oops! An unexpected error occurred.', 'error');
        }
      }
    });
    this.subs.add(deleteSub);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
