import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PaymentComponent } from '../payment.component';

@Component({
  selector: 'app-payment-main',
  imports: [
    MatTabsModule,
    PaymentComponent
],
  templateUrl: './payment-main.component.html',
  styleUrl: './payment-main.component.scss'
})
export class PaymentMainComponent {

}
