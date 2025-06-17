import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PaymentPayNowMonthly {
  orderMonthlyTuition: number | undefined;
  studentId: string | undefined;
  description: string | undefined;
  amountToPay: number | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentPayNowMonthlyTuitionService {
  private storageKey = 'pay_now_monthly_tuition';
      private _enrollment$ = new BehaviorSubject<PaymentPayNowMonthly | null>(this.getInitialStudentData());

      // pega valor atual
      get enrollment$() {
        return this._enrollment$.asObservable();
      }

      // Método para obter o valor atual (use com cautela)
      get currentEnrollment(): PaymentPayNowMonthly {
        return this._enrollment$.value!;
      }

      setEnrollmentStudent(enrollment: PaymentPayNowMonthly): void {
        this.clear();
        this._enrollment$.next(enrollment);
        sessionStorage.setItem(this.storageKey, JSON.stringify(enrollment));
      }

      clear(): void {
        this._enrollment$.next(null);
        sessionStorage.removeItem(this.storageKey);
      }

      private getInitialStudentData(): PaymentPayNowMonthly | null {
        const data = sessionStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) as PaymentPayNowMonthly : null;
      }

  updateAttribute<K extends keyof PaymentPayNowMonthly>(key: K, value: PaymentPayNowMonthly[K]): void {
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
      const newEnrollment = { [key]: value } as unknown as PaymentPayNowMonthly;
      this.setEnrollmentStudent(newEnrollment);
    }
  }
}
