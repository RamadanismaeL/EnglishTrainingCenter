import { Component } from '@angular/core';

@Component({
  selector: 'app-login-footer',
  imports: [],
  templateUrl: './login-footer.component.html',
  styleUrl: './login-footer.component.scss'
})
export class LoginFooterComponent {
  private author = "Ramadan I.A. Ismael";
  private institution = "English Training Center";
  //© 2025 | Ramadan I.A. Ismael · License: English Training Center · All rights reserved

  footer = `© 2025 · ${this.author} · Licence: ${this.institution} · All rights reserved`
}
