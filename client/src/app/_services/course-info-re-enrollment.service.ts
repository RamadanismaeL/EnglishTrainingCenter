import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CourseInfoReEnrollmentDto } from '../_interfaces/course-info-re-enrollment-dto';

@Injectable({
  providedIn: 'root'
})
export class CourseInfoReEnrollmentService {
  private storageKey = 'enrollment_student';
    private _enrollment$ = new BehaviorSubject<CourseInfoReEnrollmentDto | null>(this.getInitialStudentData());

    // pega valor atual
    get enrollment$() {
      return this._enrollment$.asObservable();
    }

    // Método para obter o valor atual (use com cautela)
    get currentEnrollment(): CourseInfoReEnrollmentDto {
      return this._enrollment$.value!;
    }

    setEnrollmentStudent(enrollment: CourseInfoReEnrollmentDto): void {
      this.clear();
      this._enrollment$.next(enrollment);
      sessionStorage.setItem(this.storageKey, JSON.stringify(enrollment));
    }

    clear(): void {
      this._enrollment$.next(null);
      sessionStorage.removeItem(this.storageKey);
    }

    private getInitialStudentData(): CourseInfoReEnrollmentDto | null {
      const data = sessionStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) as CourseInfoReEnrollmentDto : null;
    }
}
