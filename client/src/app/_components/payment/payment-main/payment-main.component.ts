import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PaymentComponent } from '../payment.component';
import { MonthyTuitionMainViewComponent } from "../MonthlyTuition/monthy-tuition-main-view/monthy-tuition-main-view.component";

@Component({
  selector: 'app-payment-main',
  imports: [
    MatTabsModule,
    PaymentComponent,
    MonthyTuitionMainViewComponent
],
  templateUrl: './payment-main.component.html',
  styleUrl: './payment-main.component.scss'
})
export class PaymentMainComponent {

}
