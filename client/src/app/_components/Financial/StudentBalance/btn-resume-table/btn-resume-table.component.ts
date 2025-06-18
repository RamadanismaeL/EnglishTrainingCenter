import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { RouterLink } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { StudentShareIdService } from '../../../../_services/student-share-id.service';
import { TitleNavbarService } from '../../../../_services/title-navbar.service';

@Component({
  selector: 'app-btn-resume-table',
  imports: [
    MatIconModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './btn-resume-table.component.html',
  styleUrl: './btn-resume-table.component.scss'
})
export class BtnResumeTableComponent implements ICellRendererAngularComp {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  positionL = new FormControl(this.positionOptions[2]);

  params: any;

  constructor (private titleNavbarService: TitleNavbarService, private studentShareId: StudentShareIdService)
  {}

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  navigateTo (breadcrumbs: { label: string, url?: any[] }) {
    this.titleNavbarService.addBreadcrumb(breadcrumbs);

    console.log(`Dados = ${this.params.data.studentID}`)
    this.studentShareId.setEnrollmentStudent(this.params.data.studentID);
  }
}
