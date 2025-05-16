import { Component, inject, OnInit } from '@angular/core';
import { RamNavbarComponent } from "../ram-navbar/ram-navbar.component";
import { RamCenterComponent } from "../ram-center/ram-center.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RamLeftComponent } from "../ram-left/ram-left.component";
import { MatCardModule } from '@angular/material/card';
import { RamFooterComponent } from "../ram-footer/ram-footer.component";
import {MatSidenavModule} from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../_services/login.service';
import { NotificationHubService } from '../../_services/notification-hub.service';
import { TitleNavbarService } from '../../_services/title-navbar.service';

@Component({
  selector: 'app-ram',
  imports: [
    RamNavbarComponent,
    RamCenterComponent,
    RouterModule,
    RamLeftComponent,
    MatCardModule,
    RamFooterComponent,
    MatSidenavModule,
    CommonModule
],
  templateUrl: './ram.component.html',
  styleUrl: './ram.component.scss'
})
export class RamComponent implements OnInit {
  isCollapsed : boolean = sessionStorage.getItem('ramNavBarMenuiconchange') === 'true' ? true : false;
  private readonly loginService = inject(LoginService);

  constructor(private notificationHub: NotificationHubService, private router: Router, private route: ActivatedRoute, private titleNavbarService: TitleNavbarService)
  {
    sessionStorage.setItem('ramNavBarMenuiconchange', `${this.isCollapsed}`);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    sessionStorage.setItem('ramNavBarMenuiconchange', `${this.isCollapsed}`);
  }

  isLoggedIn() { return this.loginService.isLoggedIn() }

  ngOnInit() {
    this.notificationHub.startConnection();
    // Só redireciona se nenhum outlet estiver ativo
    const hasOutlet = this.route.children.some(child => child.outlet === 'ramRouter');

    if (!hasOutlet) {
      this.router.navigate([{ outlets: { ramRouter: ['dashboard'] } }], {
        relativeTo: this.route
      });
      //this.titleNavbarService.setTitle('DASHBOARD')

      this.titleNavbarService.setBreadcrumbs([
        { label: 'DASHBOARD' }
      ]);
    }
  }
}
