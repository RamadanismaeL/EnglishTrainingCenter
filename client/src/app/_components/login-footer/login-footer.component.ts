import { Component } from '@angular/core';

@Component({
  selector: 'app-login-footer',
  imports: [],
  templateUrl: './login-footer.component.html',
  styleUrl: './login-footer.component.scss'
})
export class LoginFooterComponent {
  private currentYear = new Date().getFullYear();
  private author = "Ramadan Ibraimo A. Ismael";
  private country = "Mozambique";
  private institution = "English Training Center";

  footer = `Generated for ${this.institution} · Made in ${this.country} by ${this.author} · © ${this.currentYear} · All rights reserved.`;

  // eg.: Copyright © 2025 Made in Mozambique by Ramadan IsmaeL · All rights reserved.
}
