import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentCourseInfoListActive } from '../_interfaces/student-course-info-list-active';

@Injectable({
  providedIn: 'root'
})
export class StudentCourseInfoService {
  private readonly myUrl : string = environment.myUrl;

  constructor(private http: HttpClient)
  {}

  getListStudentCourseInfoActive = () : Observable<StudentCourseInfoListActive> => this.http
      .get<StudentCourseInfoListActive>(`${this.myUrl}/StudentCourseInfo/get-list-student-course-info-active`, {headers : { 'Allow-Offline' : 'true' }});
}
