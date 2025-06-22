import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LoginSigninDto } from '../_interfaces/login-signin-dto';
import { catchError, Observable, retry, tap, throwError, timer } from 'rxjs';
import { ResponseDto } from '../_interfaces/response-dto';
import { LoginTokenDto } from '../_interfaces/login-token-dto';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly myUrl : string = environment.myUrl; // URL da API
  private readonly userKey = 'auth_data'; // Chave para armazenamento
  private readonly tokenRefreshThreshold = 500; // Tempo em segundos antes do token expirar para considerar que está prestes a expirar

  constructor(private http: HttpClient)
  {}

  // Realiza o login do usuário
  loginSignIn(data: LoginSigninDto) : Observable<ResponseDto>
  {
    //const headers = { 'Allow-Offline' : 'true' }; // Adicionando cabeçalho para permitir offline

    return this.http
      .post<ResponseDto>(`${this.myUrl}/Login/sign-in`, data/*, {headers}*/)
      .pipe(
        // O operador 'tap' permite realizar efeitos colaterais sem modificar o fluxo de dados
        tap(response => {
          if(response.isSuccess)
          {
            // Se o login for bem-sucedido, armazena os dados de autenticação, como o token
            this.storeAuthData(response);
          }
        }),
        // O operador 'retry' vai tentar novamente a requisição em caso de falha
        // 'count' define o número de tentativas e 'delay' define o intervalo entre as tentativas (aqui é multiplicado pelo número de tentativas).
        retry({
          count: 0,
          delay: (retryCount) => timer(retryCount * 1000) // 1s,...
        }),
        // O operador 'catchError' captura qualquer erro que ocorra no fluxo e permite tratá-lo
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  // Armazena os dados de autenticação
  private storeAuthData(auhtData: ResponseDto): void
  {
    sessionStorage.setItem(this.userKey, JSON.stringify(auhtData));
  }

  // Usado no interceptor
  // ng g interceptor interceptor/token
  getToken () : string | null {
    const authData = this.getAuthData();
    return authData?.token || null;
  }

  getRefreshToken () : string | null {
    const authData = this.getAuthData();
    return authData?.refreshToken || null;
  }

  // Obtém todos os dados de autenticação armazenados
  private getAuthData(): ResponseDto | null {
    const storedData = sessionStorage.getItem(this.userKey);
    if(!storedData) return null;

    try
    {
      return JSON.parse(storedData) as ResponseDto;
    } catch {
      return null;
    }
  }

  // Atualiza o token de autenticação usando o refresh token
  refreshToken(data: LoginTokenDto): Observable<ResponseDto> {
    return this.http
      .post<ResponseDto>(`${this.myUrl}/Login/refresh-token`, data, {
        headers: { 'Allow-Offline': 'true' }
      })
      .pipe(
        tap(response => {
          if (response.isSuccess) {
            this.storeAuthData(response);
          }
        }),
        catchError(error => {
          return this.handleError(error);
        })
      );
  }

  // Verifica se o token está prestes a expirar
  isTokenAboutToExpire(): boolean
  {
    const token = this.getToken();
    if(!token) return true;

    try {
      const decode : any = jwtDecode(token);
      const now = Date.now() / 1000;
      return decode.exp - now < this.tokenRefreshThreshold;
    } catch {
      return true;
    }
  }

  // Realiza logout do usuário
  logout () : Observable<ResponseDto>
  {
    return this.http
      .post<ResponseDto>(`${this.myUrl}/Login/logout`, {}, { headers : { 'Allow-Offline' : 'true' } })
        .pipe(
          tap(response => {
            if(response.isSuccess) {
              this.clearAuthData();
            }
          }),
          catchError(this.handleError)
        );
  }

  // Limpa os dados de autenticação
  clearAuthData() : void
  {
    //sessionStorage.removeItem(this.userKey);
    sessionStorage.clear();
  }

  // Obtém os detalhes do usuário a partir do token
  getUserDetail() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return {
        id: decoded.sub,
        fullName: decoded.name,
        email: decoded.email,
        role: decoded.role || []
      };
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  }

  // Verifica se o usuário está autenticado
  isLoggedIn () : boolean {
    return !!this.getToken(); // !! força a conversão para booleano
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Authentication error: ',error);

    let errorMessage = 'Ocorreu um erro desconhecido';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}\nMensagem: ${error.message}`
    }

    return throwError(() => new Error(errorMessage));
  }
}
