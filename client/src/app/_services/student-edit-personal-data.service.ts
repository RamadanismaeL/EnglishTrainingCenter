import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StudentListProfileEditDto } from '../_interfaces/student-list-profile-edit-dto';

@Injectable({
  providedIn: 'root'
})
export class StudentEditPersonalDataService {
  private storageKey = 'student_edit_personal_data';
  private _enrollment$ = new BehaviorSubject<StudentListProfileEditDto | null>(this.getInitialStudentData());

  // pega valor atual
  get enrollment$() {
    return this._enrollment$.asObservable();
  }

  // Método para obter o valor atual (use com cautela)
  get currentEnrollment(): StudentListProfileEditDto {
    return this._enrollment$.value!;
  }

  setEnrollmentStudent(enrollment: StudentListProfileEditDto): void {
    this.clear();
    this._enrollment$.next(enrollment);
    sessionStorage.setItem(this.storageKey, JSON.stringify(enrollment));
  }

  clear(): void {
    this._enrollment$.next(null);
    sessionStorage.removeItem(this.storageKey);
  }

  private getInitialStudentData(): StudentListProfileEditDto | null {
    const data = sessionStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) as StudentListProfileEditDto : null;
  }
}
