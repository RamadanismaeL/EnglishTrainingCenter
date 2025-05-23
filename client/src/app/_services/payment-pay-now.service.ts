import { Injectable } from '@angular/core';
import { PaymentPayNow } from '../_interfaces/payment-pay-now';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentPayNowService {
  private storageKey = 'payment_pay_now';
      private _enrollment$ = new BehaviorSubject<PaymentPayNow | null>(this.getInitialStudentData());

      // pega valor atual
      get enrollment$() {
        return this._enrollment$.asObservable();
      }

      // Método para obter o valor atual (use com cautela)
      get currentEnrollment(): PaymentPayNow {
        return this._enrollment$.value!;
      }

      setEnrollmentStudent(enrollment: PaymentPayNow): void {
        this.clear();
        this._enrollment$.next(enrollment);
        sessionStorage.setItem(this.storageKey, JSON.stringify(enrollment));
      }

      clear(): void {
        this._enrollment$.next(null);
        sessionStorage.removeItem(this.storageKey);
      }

      private getInitialStudentData(): PaymentPayNow | null {
        const data = sessionStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) as PaymentPayNow : null;
      }

  updateAttribute<K extends keyof PaymentPayNow>(key: K, value: PaymentPayNow[K]): void {
    const current = this._enrollment$.value;

    if (current) {
      // Create a new object with the updated property
      const updated = {
        ...current,
        [key]: value
      };

      this.setEnrollmentStudent(updated);
    } else {
      // If there's no current enrollment, create a new one with just this property
      // Note: You might want to handle this case differently depending on your needs
      const newEnrollment = { [key]: value } as unknown as PaymentPayNow;
      this.setEnrollmentStudent(newEnrollment);
    }
  }
}
