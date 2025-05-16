import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-navbar',
  imports: [
    MatToolbarModule,
    RouterModule
  ],
  templateUrl: './login-navbar.component.html',
  styleUrl: './login-navbar.component.scss'
})
export class LoginNavbarComponent {

}
