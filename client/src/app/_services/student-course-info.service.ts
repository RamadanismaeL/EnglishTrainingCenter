import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentCourseInfoListActive } from '../_interfaces/student-course-info-list-active';
import { StudentCourseInfoUpdateQuizOneTwoDto } from '../_interfaces/student-course-info-update-quiz-one-two-dto';
import { ResponseDto } from '../_interfaces/response-dto';
import { StudentCourseInfoProgressHistoryDto } from '../_interfaces/student-course-info-progress-history-dto';
import { StudentCourseInfoUpdateQuizDto } from '../_interfaces/student-course-info-update-quiz-dto';

@Injectable({
  providedIn: 'root'
})
export class StudentCourseInfoService {
  private readonly myUrl : string = environment.myUrl;

  constructor(private http: HttpClient)
  {}

  getListStudentCourseInfoActive = () : Observable<StudentCourseInfoListActive> => this.http
      .get<StudentCourseInfoListActive>(`${this.myUrl}/StudentCourseInfo/get-list-student-course-info-active`, {headers : { 'Allow-Offline' : 'true' }});

  updateQuiz = (data : StudentCourseInfoUpdateQuizDto) : Observable<ResponseDto> => this.http
        .patch<ResponseDto>(`${this.myUrl}/StudentCourseInfo/update-quiz`, data, {headers : { 'Allow-Offline' : 'true' }});

  updateQuizOneTwo = (data : StudentCourseInfoUpdateQuizOneTwoDto) : Observable<ResponseDto> => this.http
        .patch<ResponseDto>(`${this.myUrl}/StudentCourseInfo/update-quiz-one-two`, data, {headers : { 'Allow-Offline' : 'true' }});

  getListStudentCourseInfoProgressHistoryByOrder = (studentId: string) : Observable<StudentCourseInfoProgressHistoryDto> => this.http
      .post<StudentCourseInfoProgressHistoryDto>(`${this.myUrl}/StudentCourseInfo/get-list-student-course-info-progress-history-by-studentId/${studentId}`, {headers : { 'Allow-Offline' : 'true' }});
}
