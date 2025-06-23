import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ListFinancialExpenseDto } from '../_interfaces/list-financial-expense-dto';
import { Observable } from 'rxjs';
import { ResponseDto } from '../_interfaces/response-dto';
import { ListFinancialExpenseCreateDto } from '../_interfaces/list-financial-expense-create-dto';
import { ListFinancialExpenseCreatePendingDto } from '../_interfaces/list-financial-expense-create-pending-dto';
import { ListFinancialExpensePendingDto } from '../_interfaces/list-financial-expense-pending-dto';
import { ListTotalTransactionsStudentBalance } from '../_interfaces/list-total-transactions-student-balance';
import { ListFinancialDailyReportTransactionPayment } from '../_interfaces/list-financial-daily-report-transaction-payment';
import { ListFinancialDailyReportBalanceDto } from '../_interfaces/list-financial-daily-report-balance-dto';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private readonly myUrl : string = environment.myUrl;

  constructor(private http: HttpClient)
  {}

  create = (data : ListFinancialExpenseCreateDto) : Observable<ResponseDto> => this.http
      .post<ResponseDto>(`${this.myUrl}/FinancialExpense/create`, data,
        {headers : { 'Allow-Offline' : 'true' }});

  updateStatus = (id: number) : Observable<ResponseDto> => this.http
      .patch<ResponseDto>(`${this.myUrl}/FinancialExpense/cancel-status/${id}`,
          {headers : { 'Allow-Offline' : 'true' }});

  getListAll = () : Observable<ListFinancialExpenseDto> => this.http
      .get<ListFinancialExpenseDto>(`${this.myUrl}/FinancialExpense/get-list-all`, {headers : { 'Allow-Offline' : 'true' }});

  createPending = (data : ListFinancialExpenseCreatePendingDto) : Observable<ResponseDto> => this.http
      .post<ResponseDto>(`${this.myUrl}/FinancialExpense/create-pending`, data,
        {headers : { 'Allow-Offline' : 'true' }});

  updateStatusPending = (id: number) : Observable<ResponseDto> => this.http
      .patch<ResponseDto>(`${this.myUrl}/FinancialExpense/pending-status/${id}`,
          {headers : { 'Allow-Offline' : 'true' }});

  getListPending = () : Observable<ListFinancialExpensePendingDto> => this.http
      .get<ListFinancialExpensePendingDto>(`${this.myUrl}/FinancialExpense/get-list-pending`, {headers : { 'Allow-Offline' : 'true' }});

  updateStatusPaid = (id: number, method: string) : Observable<ResponseDto> => this.http
      .patch<ResponseDto>(`${this.myUrl}/FinancialExpense/paid-status/${id}/${method}`,
          {headers : { 'Allow-Offline' : 'true' }});

  delete = (id : number) : Observable<ResponseDto> => this.http
    .delete<ResponseDto>(`${this.myUrl}/FinancialExpense/delete/${id}`, {headers : { 'Allow-Offline' : 'true' }});


  // Daily Report
  getListDailyReport = () : Observable<ListFinancialExpenseDto> => this.http
    .get<ListFinancialExpenseDto>(`${this.myUrl}/FinancialExpense/get-list-daily-report`, {headers : { 'Allow-Offline' : 'true' }});

  getListDailyReportRevenue = () : Observable<ListTotalTransactionsStudentBalance> => this.http
    .get<ListTotalTransactionsStudentBalance>(`${this.myUrl}/Students/get-list-daily-report-revenue`,
    {headers : { 'Allow-Offline' : 'true' }});

  getListDailyReportTransaction = () : Observable<ListFinancialDailyReportTransactionPayment> => this.http
    .get<ListFinancialDailyReportTransactionPayment>(`${this.myUrl}/Students/get-list-daily-report-transaction`,
    {headers : { 'Allow-Offline' : 'true' }});

  getListDailyReportBalance = () : Observable<ListFinancialDailyReportBalanceDto> => this.http
    .get<ListFinancialDailyReportBalanceDto>(`${this.myUrl}/Students/get-list-daily-report-balance`,
    {headers : { 'Allow-Offline' : 'true' }});
}
