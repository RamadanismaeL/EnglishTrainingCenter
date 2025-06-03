import { Component, inject, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { FormControl } from '@angular/forms';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { NotificationHubService } from '../../../_services/notification-hub.service';
import { StudentCourseInfoService } from '../../../_services/student-course-info.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackBarService } from '../../../_services/snack-bar.service';

@Component({
  selector: 'app-btn-student-finished-meprogress-history',
  imports: [
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './btn-student-finished-meprogress-history.component.html',
  styleUrl: './btn-student-finished-meprogress-history.component.scss'
})
export class BtnStudentFinishedMEProgressHistoryComponent implements ICellRendererAngularComp, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  positionL = new FormControl(this.positionOptions[2]);
  private subs = new Subscription();
  params: any;
  private readonly alert = inject(SnackBarService);

  constructor(private notificationHub: NotificationHubService, private courseInfoService: StudentCourseInfoService)
  {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onCancel()
  {
    //console.log('StudentID: ', this.params.data.order);
    this.subs.add(
      this.courseInfoService.cancelStatus(this.params.data.order).subscribe({
        next: () => {
          this.notificationHub.sendMessage("Status course info cancelled.");
        },
        error: (error) => {
          this.handleError(error);
        }
      })
    );
  }

  private handleError(error: HttpErrorResponse)
    {
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
