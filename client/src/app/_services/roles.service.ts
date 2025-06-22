import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolesResponseDto } from '../_interfaces/roles-response-dto';
import { ResponseDto } from '../_interfaces/response-dto';
import { RolesCreateDto } from '../_interfaces/roles-create-dto';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly myUrl : string = environment.myUrl;

  constructor(private http : HttpClient)
  {}

  create = (data : RolesCreateDto) : Observable<ResponseDto> =>
    this.http
      .post<ResponseDto>(`${this.myUrl}/Roles/create`, data, {headers : { 'Allow-Offline' : 'true' }});

  details = () : Observable<RolesResponseDto[]> => {
    const headers = { 'Allow-Offline' : 'true' }; // Adicionando cabeçalho para permitir offline

    return this.http
      .get<RolesResponseDto[]>(`${this.myUrl}/Roles/details`, {headers});
  }
}
