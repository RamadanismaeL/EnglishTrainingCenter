import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from '../_interfaces/response-dto';
import { TrainerValidateResetCode } from '../_interfaces/trainer-validate-reset-code';
import { TrainerResetPasswordDto } from '../_interfaces/trainer-reset-password-dto';
import { TrainerDetailsDto } from '../_interfaces/trainer-details-dto';
import { TrainerChangePasswordDto } from '../_interfaces/trainer-change-password-dto';
import { TrainerSendNewCode } from '../_interfaces/trainer-send-new-code';
import { TrainerUpdateSubsidyDto } from '../_interfaces/trainer-update-subsidy-dto';

@Injectable({
  providedIn: 'root'
})
export class TrainersService {
  private readonly myUrl : string = environment.myUrl; // my backend API

  constructor(private http: HttpClient)
  {}

  create = (data : FormData) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/Trainers/create`, data, {headers : { 'Allow-Offline' : 'true' }});

  details = () : Observable<TrainerDetailsDto> => this.http
    .get<TrainerDetailsDto>(`${this.myUrl}/Trainers/details`, {headers : { 'Allow-Offline' : 'true' }});

  anyDetails = () : Observable<number> => this.http
    .get<number>(`${this.myUrl}/Trainers/any-details`, {headers : { 'Allow-Offline' : 'true' }});

  detailsSubsidy = () : Observable<TrainerDetailsDto> => this.http
    .get<TrainerDetailsDto>(`${this.myUrl}/Trainers/details-subsidy`, {headers : { 'Allow-Offline' : 'true' }});

  update = (data : FormData) : Observable<ResponseDto> => this.http
    .put<ResponseDto>(`${this.myUrl}/Trainers/update`, data, {headers : { 'Allow-Offline' : 'true' }});

  updateProfilePicture = (formData : FormData) : Observable<ResponseDto> => this.http
    .put<ResponseDto>(`${this.myUrl}/Trainers/update-profile-picture`, formData, {headers : { 'Allow-Offline' : 'true' }});

  updateSubsidy = (trainerSubsidy: TrainerUpdateSubsidyDto) : Observable<ResponseDto> => this.http
    .put<ResponseDto>(`${this.myUrl}/Trainers/update-subsidy`, trainerSubsidy, {headers : { 'Allow-Offline' : 'true' }});

  deleteProfileImage = (id: string) :
    Observable<ResponseDto> => this.http
    .delete<ResponseDto>(`${this.myUrl}/Trainers/delete-profile-photo/${id}`, {headers : { 'Allow-Offline' : 'true' }});

  delete = (id: string) :
    Observable<ResponseDto> => this.http
    .delete<ResponseDto>(`${this.myUrl}/Trainers/delete/${id}`, {headers : { 'Allow-Offline' : 'true' }});

  detail = () : Observable<TrainerDetailsDto> => this.http
    .get<TrainerDetailsDto>(`${this.myUrl}/Trainers/detail`, {headers : { 'Allow-Offline' : 'true' }});

  validateResetCode = (data : TrainerValidateResetCode) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/Trainers/validate-reset-code`, data, {headers : { 'Allow-Offline' : 'true' }});

  forgotPassword = (email : string) : Observable<ResponseDto> => this.http
  .post<ResponseDto>(`${this.myUrl}/Trainers/forgot-password`, email);

  sendNewCode = (data : TrainerSendNewCode) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/Trainers/send-new-code`, data);

  resetPassword = (data : TrainerResetPasswordDto) : Observable<ResponseDto> => this.http
      .post<ResponseDto>(`${this.myUrl}/Trainers/reset-password`, data, {headers : { 'Allow-Offline' : 'true' }});

  changePassword = (data : TrainerChangePasswordDto) : Observable<ResponseDto> => this.http
    .post<ResponseDto>(`${this.myUrl}/Trainers/change-password`, data, {headers : { 'Allow-Offline' : 'true' }});
}
