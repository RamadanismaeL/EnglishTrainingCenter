import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SetupService {
  private readonly myUrl : string = environment.myUrl; // my backend API

  constructor(private http: HttpClient)
  {}

  migrateDb = () : Observable<string> => this.http.post<string>(`${this.myUrl}/Setup/migrate`, {}, {headers : { 'Allow-Offline' : 'true' }});

  checkDatabase(): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`${this.myUrl}/Setup/check-db`, {
      headers: { 'Allow-Offline': 'true' }
    }).pipe(
      map(response => response.exists),
      catchError(() => of(false)) // Se der erro, retorna false
    );
  }
}
