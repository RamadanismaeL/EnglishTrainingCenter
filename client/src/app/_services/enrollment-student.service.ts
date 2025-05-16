import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StudentsCreateDto } from '../_interfaces/students-create-dto';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentStudentService {
  private storageKey = 'enrollment_student';
  private _enrollment$ = new BehaviorSubject<StudentsCreateDto | null>(this.getInitialStudentData());

  // pega valor atual
  get enrollment$() {
    return this._enrollment$.asObservable();
  }

  // Método para obter o valor atual (use com cautela)
  get currentEnrollment(): StudentsCreateDto {
    return this._enrollment$.value!;
  }

  setEnrollmentStudent(enrollment: StudentsCreateDto): void {
    this.clear();
    this._enrollment$.next(enrollment);
    sessionStorage.setItem(this.storageKey, JSON.stringify(enrollment));
  }

  clear(): void {
    this._enrollment$.next(null);
    sessionStorage.removeItem(this.storageKey);
  }

  private getInitialStudentData(): StudentsCreateDto | null {
    const data = sessionStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) as StudentsCreateDto : null;
  }
}
