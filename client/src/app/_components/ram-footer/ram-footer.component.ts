import { Component } from '@angular/core';

@Component({
  selector: 'app-ram-footer',
  imports: [],
  templateUrl: './ram-footer.component.html',
  styleUrl: './ram-footer.component.scss'
})
export class RamFooterComponent {
  private currentYear = new Date().getFullYear();
  private author = "Ramadan Ibraimo A. Ismael";
  private country = "Mozambique";
  private institution = "English Training Center";

  footer = `Licence: ${this.institution} · Made in ${this.country} by ${this.author} · © ${this.currentYear} · All rights reserved.`;

  //eg.: Copyright © 2025 Made in Mozambique by Ramadan IsmaeL · All rights reserved.
}
