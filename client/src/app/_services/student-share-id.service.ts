import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface StudentShareId {
  id: string | undefined
}

@Injectable({
  providedIn: 'root'
})
export class StudentShareIdService {
  private storageKey = 'student_share';
  private _enrollment$ = new BehaviorSubject<string | null>(this.getInitialStudentData());

  // pega valor atual
  get enrollment$() {
    return this._enrollment$.asObservable();
  }

  // Método para obter o valor atual (use com cautela)
  get currentEnrollment(): string {
    return this._enrollment$.value!;
  }

  setEnrollmentStudent(enrollment: string): void {
    this.clear();
    this._enrollment$.next(enrollment);
    sessionStorage.setItem(this.storageKey, JSON.stringify(enrollment));
  }

  clear(): void {
    this._enrollment$.next(null);
    sessionStorage.removeItem(this.storageKey);
  }

  private getInitialStudentData(): string | null {
    const data = sessionStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) as string : null;
  }
}
