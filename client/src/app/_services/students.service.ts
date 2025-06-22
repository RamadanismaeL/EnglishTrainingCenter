import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
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
import { StudentListProfileDto } from '../_interfaces/student-list-profile-dto';
import { StudentListProfileEnrollmentDto } from '../_interfaces/student-list-profile-enrollment-dto';
import { StudentListProfileEditDto } from '../_interfaces/student-list-profile-edit-dto';
import { ListStudentBalanceDto } from '../_interfaces/list-student-balance-dto';
import { ListTransactionsStudentBalance } from '../_interfaces/list-transactions-student-balance';
import { ListTotalTransactionsStudentBalance } from '../_interfaces/list-total-transactions-student-balance';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private readonly myUrl : string = environment.myUrl;

  constructor(private http: HttpClient)
  {}

  create = (data : StudentsCreateDto) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/Students/create`, data,
      {headers : { 'Allow-Offline' : 'true' }});

  update = (data : StudentListProfileEditDto) : Observable<ResponseDto> => this.http
      .patch<ResponseDto>(`${this.myUrl}/Students/update`, data,
        {headers : { 'Allow-Offline' : 'true' }});

  updateStatus = (order: number[], status: string) : Observable<ResponseDto> => this.http
      .patch<ResponseDto>(`${this.myUrl}/Students/update-status/${status}`, order,
        {headers : { 'Allow-Offline' : 'true' }});

  getStudentById = () : Observable<string> => this.http
    .get(`${this.myUrl}/Students/getStudentById`,
      { headers: { 'Allow-Offline': 'true' },
      responseType: 'text'
  });

  getStudentPaymentByLastId = () : Observable<string> => this.http
    .get(`${this.myUrl}/StudentPayment/getStudentPaymentByLastId`,
      { headers: { 'Allow-Offline': 'true' },
      responseType: 'text'
  });

  createStudentPayment = (data : StudentPaymentCreateDto) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/StudentPayment/create`, data,
      {headers : { 'Allow-Offline' : 'true' }});

  detailStudentEnrollmentFormById = (id: string) : Observable<StudentEnrollmentFormModel> => this.http
    .post<StudentEnrollmentFormModel>(`${this.myUrl}/Students/detail-student-enrollment-form-by-id/${id}`,
      {headers : { 'Allow-Offline' : 'true' }});

  detailStudentPaymentReceiptById = (id: string) : Observable<StudentPaymentModel> => this.http
    .post<StudentPaymentModel>(`${this.myUrl}/StudentPayment/detail-student-payment-by-id/${id}`,
      {headers : { 'Allow-Offline' : 'true' }});

  /*detailStudentEnrollmentForm = () : Observable<StudentEnrollmentFormModel> => this.http
    .get<StudentEnrollmentFormModel>(`${this.myUrl}/Students/detail-student-enrollment-form`, {headers : { 'Allow-Offline' : 'true' }});*/

  detailStudentData = () : Observable<StudentDataModel> => this.http
    .get<StudentDataModel>(`${this.myUrl}/Students/detail-student-data`,
      {headers : { 'Allow-Offline' : 'true' }});

  getStudentDataByFullName = (fullName: string) : Observable<StudentDataModel> => this.http
    .post<StudentDataModel>(`${this.myUrl}/Students/detail-student-data-by-fullName/${fullName}`,
      {headers : { 'Allow-Offline' : 'true' }});

  createStudentCourseInfo = (data : CourseInfoModel) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/StudentCourseInfo/create`, data,
      {headers : { 'Allow-Offline' : 'true' }});

  getPriceDueById = (id: string) : Observable<number> => this.http
    .post<number>(`${this.myUrl}/StudentPayment/get-price-due-by-id/${id}`,
      {headers : { 'Allow-Offline' : 'true' }});

  GetStudentListProfileEditById = (id: string) : Observable<StudentListProfileEditDto> => this.http
    .post<StudentListProfileEditDto>(`${this.myUrl}/Students/get-student-list-profile-edit-by-id/${id}`,
      {headers : { 'Allow-Offline' : 'true' }});

  getStudentListProfileById = (id: string) : Observable<StudentListProfileDto> => this.http
    .post<StudentListProfileDto>(`${this.myUrl}/Students/get-student-list-profile-by-id/${id}`,
      {headers : { 'Allow-Offline' : 'true' }});

  getStudentListProfileEnrollmentById = (id: string) : Observable<StudentListProfileEnrollmentDto> => this.http
    .post<StudentListProfileEnrollmentDto>(`${this.myUrl}/Students/get-student-list-profile-enrollment-by-id/${id}`,
      {headers : { 'Allow-Offline' : 'true' }});

  // Students : ACTIVE
  getListStudentActive = () : Observable<ListStudentActiveDto> => this.http
    .get<ListStudentActiveDto>(`${this.myUrl}/Students/get-list-student-active`,
      {headers : { 'Allow-Offline' : 'true' }});

  getListStudentCompleted = () : Observable<ListStudentActiveDto> => this.http
    .get<ListStudentActiveDto>(`${this.myUrl}/Students/get-list-student-completed`,
      {headers : { 'Allow-Offline' : 'true' }});

  getListStudentInactive = () : Observable<ListStudentActiveDto> => this.http
    .get<ListStudentActiveDto>(`${this.myUrl}/Students/get-list-student-inactive`,
      {headers : { 'Allow-Offline' : 'true' }});

  createTuitionInEnrollment = (studentID: string) : Observable<ResponseDto> => this.http
        .post<ResponseDto>(`${this.myUrl}/StudentMonthlyTuition/create/${studentID}`, {headers : { 'Allow-Offline' : 'true' }});

  getListStudentBalance = () : Observable<ListStudentBalanceDto> => this.http
    .get<ListStudentBalanceDto>(`${this.myUrl}/Students/get-list-student-balance`,
      {headers : { 'Allow-Offline' : 'true' }});

  getTransactionsByStudentId = (id: string) : Observable<ListTransactionsStudentBalance> => this.http
    .post<ListTransactionsStudentBalance>(`${this.myUrl}/Students/get-transactions-by-student-id/${id}`,
      {headers : { 'Allow-Offline' : 'true' }});

  getTotalTransactionsByStudentId = (id: string) : Observable<ListTotalTransactionsStudentBalance> => this.http
    .post<ListTotalTransactionsStudentBalance>(`${this.myUrl}/Students/get-total-transactions-by-student-id/${id}`,
      {headers : { 'Allow-Offline' : 'true' }});
}
