import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoaderService } from '../../_services/loader.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loader',
  imports: [
    CommonModule
  ],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  isLoading$: Observable<boolean>;

  constructor(private loaderService : LoaderService) {
    this.isLoading$ = this.loaderService.isLoading$;
  }
}
