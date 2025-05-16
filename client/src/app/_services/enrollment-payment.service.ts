import { Injectable } from '@angular/core';
import { StudentPaymentCreateDto } from '../_interfaces/student-payment-create-dto';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentPaymentService {
  private storageKey = 'enrollment_payment';
    private _enrollment$ = new BehaviorSubject<StudentPaymentCreateDto | null>(this.getInitialStudentData());

    // pega valor atual
    get enrollment$() {
      return this._enrollment$.asObservable();
    }

    // Método para obter o valor atual (use com cautela)
    get currentEnrollment(): StudentPaymentCreateDto {
      return this._enrollment$.value!;
    }

    setEnrollmentStudent(enrollment: StudentPaymentCreateDto): void {
      this.clear();
      this._enrollment$.next(enrollment);
      sessionStorage.setItem(this.storageKey, JSON.stringify(enrollment));
    }

    clear(): void {
      this._enrollment$.next(null);
      sessionStorage.removeItem(this.storageKey);
    }

    private getInitialStudentData(): StudentPaymentCreateDto | null {
      const data = sessionStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) as StudentPaymentCreateDto : null;
    }
}
