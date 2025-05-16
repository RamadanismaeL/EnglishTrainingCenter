import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from "./_components/loader/loader.component";
import { NetworkComponent } from "./_components/network/network.component";
import { SnackBarComponent } from "./_components/snack-bar/snack-bar.component";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LoaderComponent,
    NetworkComponent,
    SnackBarComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
}
