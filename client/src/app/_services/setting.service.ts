import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from '../_interfaces/response-dto';
import { SettingWeeklyScheduleDto } from '../_interfaces/setting-weekly-schedule-dto';
import { SettingAcademicYearDetailDto } from '../_interfaces/setting-academic-year-detail-dto';
import { SettingAmountMtDetailsDto } from '../_interfaces/setting-amount-mt-details-dto';
import { SettingWeeklyScheduleCreateDto } from '../_interfaces/setting-weekly-schedule-create-dto';

export interface MonthlyTuition {
  id: string,
  intensive: number | undefined,
  private: number | undefined,
  regular: number | undefined,
}

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private readonly myUrl : string = environment.myUrl; // my backend API

  constructor(private http: HttpClient)
  {}

  // Academic Year
  createAcademicYear = () : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/Settings/create-academic-year`, {}, {headers : { 'Allow-Offline' : 'true' }});

  detailsAcademicYear = () : Observable<SettingAcademicYearDetailDto[]> => this.http
    .get<SettingAcademicYearDetailDto[]>(`${this.myUrl}/Settings/details-academic-year`, {headers : { 'Allow-Offline' : 'true' }});

  updateAcademicYear = (data : SettingAcademicYearDetailDto) : Observable<ResponseDto> => this.http
    .patch<ResponseDto>(`${this.myUrl}/Settings/update-academic-year`, data, {headers : { 'Allow-Offline' : 'true' }});

  deleteAcademicYear = (id : number) : Observable<ResponseDto> => this.http
    .delete<ResponseDto>(`${this.myUrl}/Settings/delete-academic-year/${id}`, {headers : { 'Allow-Offline' : 'true' }});


  // AmountMT
  createAmountMt = () : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/Settings/create-amount-mt`, {}, {headers : { 'Allow-Offline' : 'true' }});

  detailsAmountMt = () : Observable<SettingAmountMtDetailsDto[]> => this.http
    .get<SettingAmountMtDetailsDto[]>(`${this.myUrl}/Settings/details-amount-mt`, {headers : { 'Allow-Offline' : 'true' }});

  updateAmountMt = (data : SettingAmountMtDetailsDto) : Observable<ResponseDto> => this.http
    .patch<ResponseDto>(`${this.myUrl}/Settings/update-amount-mt`, data, {headers : { 'Allow-Offline' : 'true' }});

  deleteAmountMt = (id : string) : Observable<ResponseDto> => this.http
    .delete<ResponseDto>(`${this.myUrl}/Settings/delete-amount-mt/${id}`, {headers : { 'Allow-Offline' : 'true' }});


  // Monthly Tuition
  createMonthly = () : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/Settings/create-monthly`, {}, {headers : { 'Allow-Offline' : 'true' }});

  detailsMonthly = () : Observable<MonthlyTuition[]> => this.http
    .get<MonthlyTuition[]>(`${this.myUrl}/Settings/details-monthly`, {headers : { 'Allow-Offline' : 'true' }});

  updateMonthly = (data : MonthlyTuition) : Observable<ResponseDto> => this.http
    .patch<ResponseDto>(`${this.myUrl}/Settings/update-monthly`, data, {headers : { 'Allow-Offline' : 'true' }});

  // No seu setting.service.ts
  getMonthlyTuitionsByIds(ids: number[]): Observable<MonthlyTuition[]> {
    return this.http.post<MonthlyTuition[]>(`${this.myUrl}/Settings/get-monthly-by-id`, { ids }, {headers : { 'Allow-Offline' : 'true' }});
  }


  // Weekly Schedule
  createWeeklySchedule = (data : SettingWeeklyScheduleDto) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/Settings/create-weekly-schedule`, data, {headers : { 'Allow-Offline' : 'true' }});

  detailsWeeklySchedule = () : Observable<SettingWeeklyScheduleCreateDto> => this.http
    .get<SettingWeeklyScheduleCreateDto>(`${this.myUrl}/Settings/details-weekly-schedule`, {headers : { 'Allow-Offline' : 'true' }});

  updateWeeklySchedule = (data : SettingWeeklyScheduleCreateDto) : Observable<ResponseDto> => this.http
    .patch<ResponseDto>(`${this.myUrl}/Settings/update-weekly-schedule`, data, {headers : { 'Allow-Offline' : 'true' }});

  deleteWeeklySchedule = (id : number) : Observable<ResponseDto> => this.http
    .delete<ResponseDto>(`${this.myUrl}/Settings/delete-weekly-schedule/${id}`, {headers : { 'Allow-Offline' : 'true' }});
}
