import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { TitleNavbarService } from '../../../../_services/title-navbar.service';

@Component({
  selector: 'app-student-active-profile',
  imports: [
    MatMenuModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './student-active-profile.component.html',
  styleUrl: './student-active-profile.component.scss'
})
export class StudentActiveProfileComponent {
  constructor(private titleNavbarService: TitleNavbarService)
    {}

  navigateTo (breadcrumbs: { label: string, url?: any[] }) {
    this.titleNavbarService.addBreadcrumb(breadcrumbs);
  }
}
