import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SnackBarService } from '../../_services/snack-bar.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-snack-bar',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './snack-bar.component.html',
  styleUrl: './snack-bar.component.scss'
})
export class SnackBarComponent {
  constructor(public snackService: SnackBarService)
  {}
}
