import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentCourseInfoListActive } from '../_interfaces/student-course-info-list-active';
import { StudentCourseInfoUpdateQuizOneTwoDto } from '../_interfaces/student-course-info-update-quiz-one-two-dto';
import { ResponseDto } from '../_interfaces/response-dto';
import { StudentCourseInfoProgressHistoryDto } from '../_interfaces/student-course-info-progress-history-dto';
import { StudentCourseInfoUpdateQuizDto } from '../_interfaces/student-course-info-update-quiz-dto';
import { StudentCourseInfoUpdateDto } from '../_interfaces/student-course-info-update-dto';
import { StudentCourseInfoUpdateListDto } from '../_interfaces/student-course-info-update-list-dto';
import { StudentExamsUnscheduledDto } from '../_interfaces/student-exams-unscheduled-dto';

@Injectable({
  providedIn: 'root'
})
export class StudentCourseInfoService {
  private readonly myUrl : string = environment.myUrl;

  constructor(private http: HttpClient)
  {}

  getListStudentCourseInfoActive = () : Observable<StudentCourseInfoListActive> => this.http
      .get<StudentCourseInfoListActive>(`${this.myUrl}/StudentCourseInfo/get-list-student-course-info-active`, {headers : { 'Allow-Offline' : 'true' }});

  getListStudentCourseInfoCompleted = () : Observable<StudentCourseInfoListActive> => this.http
      .get<StudentCourseInfoListActive>(`${this.myUrl}/StudentCourseInfo/get-list-student-course-info-completed`, {headers : { 'Allow-Offline' : 'true' }});

  getListStudentCourseInfoInactive = () : Observable<StudentCourseInfoListActive> => this.http
      .get<StudentCourseInfoListActive>(`${this.myUrl}/StudentCourseInfo/get-list-student-course-info-inactive`, {headers : { 'Allow-Offline' : 'true' }});

  updateQuiz = (data : StudentCourseInfoUpdateQuizDto) : Observable<ResponseDto> => this.http
        .patch<ResponseDto>(`${this.myUrl}/StudentCourseInfo/update-quiz`, data, {headers : { 'Allow-Offline' : 'true' }});

  updateQuizOneTwo = (data : StudentCourseInfoUpdateQuizOneTwoDto) : Observable<ResponseDto> => this.http
        .patch<ResponseDto>(`${this.myUrl}/StudentCourseInfo/update-quiz-one-two`, data, {headers : { 'Allow-Offline' : 'true' }});

  cancelStatus = (order: number) : Observable<ResponseDto> => this.http
        .patch<ResponseDto>(`${this.myUrl}/StudentCourseInfo/cancel-status/${order}`, {headers : { 'Allow-Offline' : 'true' }});

  getListStudentCourseInfoProgressHistoryByOrder = (studentId: string) : Observable<StudentCourseInfoProgressHistoryDto> => this.http
      .post<StudentCourseInfoProgressHistoryDto>(`${this.myUrl}/StudentCourseInfo/get-list-student-course-info-progress-history-by-studentId/${studentId}`, {headers : { 'Allow-Offline' : 'true' }});

  update = (data : StudentCourseInfoUpdateDto) : Observable<ResponseDto> => this.http
        .patch<ResponseDto>(`${this.myUrl}/StudentCourseInfo/update`, data, {headers : { 'Allow-Offline' : 'true' }});

  getStudentCourseInfoUpdateListByStudentId = (studentId: string) : Observable<StudentCourseInfoUpdateListDto> => this.http
      .post<StudentCourseInfoUpdateListDto>(`${this.myUrl}/StudentCourseInfo/get-student-course-info-update-list-by-id/${studentId}`, {headers : { 'Allow-Offline' : 'true' }});

  getListStudentUnscheduledExams = () : Observable<StudentExamsUnscheduledDto> => this.http
      .get<StudentExamsUnscheduledDto>(`${this.myUrl}/StudentCourseInfo/get-list-student-unscheduled-exams`, {headers : { 'Allow-Offline' : 'true' }});
}
