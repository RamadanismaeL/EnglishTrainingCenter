import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from '../_interfaces/response-dto';
import { StudentPaymentCreateDto } from '../_interfaces/student-payment-create-dto';
import { StudentsCreateDto } from '../_interfaces/students-create-dto';
import { StudentEnrollmentFormModel } from '../_interfaces/student-enrollment-form-model';
import { StudentPaymentModel } from '../_interfaces/student-payment-model';
import { StudentDataModel } from '../_interfaces/student-data-model';
import { CourseInfoModel } from '../_interfaces/course-info-model';
import { ListStudentActiveDto } from '../_interfaces/list-student-active-dto';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private readonly myUrl : string = environment.myUrl;

  constructor(private http: HttpClient)
  {}

  create = (data : StudentsCreateDto) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/Students/create`, data, {headers : { 'Allow-Offline' : 'true' }});

  getStudentById = () : Observable<string> => this.http
    .get(`${this.myUrl}/Students/getStudentById`, { headers: { 'Allow-Offline': 'true' },
      responseType: 'text'
  });

  getStudentPaymentByLastId = () : Observable<string> => this.http
    .get(`${this.myUrl}/StudentPayment/getStudentPaymentByLastId`, { headers: { 'Allow-Offline': 'true' },
      responseType: 'text'
  });

  createStudentPayment = (data : StudentPaymentCreateDto) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/StudentPayment/create`, data, {headers : { 'Allow-Offline' : 'true' }});

  detailStudentEnrollmentFormById = (id: string) : Observable<StudentEnrollmentFormModel> => this.http
    .post<StudentEnrollmentFormModel>(`${this.myUrl}/Students/detail-student-enrollment-form-by-id/${id}`, {headers : { 'Allow-Offline' : 'true' }});

  detailStudentPaymentReceiptById = (id: string) : Observable<StudentPaymentModel> => this.http
    .post<StudentPaymentModel>(`${this.myUrl}/StudentPayment/detail-student-payment-by-id/${id}`, {headers : { 'Allow-Offline' : 'true' }});

  /*detailStudentEnrollmentForm = () : Observable<StudentEnrollmentFormModel> => this.http
    .get<StudentEnrollmentFormModel>(`${this.myUrl}/Students/detail-student-enrollment-form`, {headers : { 'Allow-Offline' : 'true' }});*/

  detailStudentData = () : Observable<StudentDataModel> => this.http
    .get<StudentDataModel>(`${this.myUrl}/Students/detail-student-data`, {headers : { 'Allow-Offline' : 'true' }});

  getStudentDataByFullName = (fullName: string) : Observable<StudentDataModel> => this.http
    .post<StudentDataModel>(`${this.myUrl}/Students/detail-student-data-by-fullName/${fullName}`, {headers : { 'Allow-Offline' : 'true' }});

  createStudentCourseInfo = (data : CourseInfoModel) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/StudentCourseInfo/create`, data, {headers : { 'Allow-Offline' : 'true' }});

  getPriceDueById = (id: string) : Observable<number> => this.http
    .post<number>(`${this.myUrl}/StudentPayment/get-price-due-by-id/${id}`, {headers : { 'Allow-Offline' : 'true' }});

  // Students : ACTIVE
  getListStudentActive = () : Observable<ListStudentActiveDto> => this.http
    .get<ListStudentActiveDto>(`${this.myUrl}/Students/get-list-student-active`, {headers : { 'Allow-Offline' : 'true' }});
}
