import { Component } from '@angular/core';

@Component({
  selector: 'app-ram-footer',
  imports: [],
  templateUrl: './ram-footer.component.html',
  styleUrl: './ram-footer.component.scss'
})
export class RamFooterComponent {
  //private currentYear = new Date().getFullYear();
  private author = "Ramadan I.A. Ismael";
  private institution = "English Training Center";
  //© 2025 | Ramadan I.A. Ismael · License: English Training Center · All rights reserved

  footer = `© 2025 · ${this.author} · Licence: ${this.institution} · All rights reserved`

  //eg.: Copyright © 2025 Made in Mozambique by Ramadan IsmaeL · All rights reserved.
}
