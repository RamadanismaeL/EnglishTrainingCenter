import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginNavbarComponent } from "../login-navbar/login-navbar.component";
import { LoginFooterComponent } from "../login-footer/login-footer.component";
import { LoginMainComponent } from "../login-main/login-main.component";

@Component({
  selector: 'app-login',
  imports: [
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    LoginNavbarComponent,
    LoginFooterComponent,
    RouterOutlet,
    LoginMainComponent
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
}
