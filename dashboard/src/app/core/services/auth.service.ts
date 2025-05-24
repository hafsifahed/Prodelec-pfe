import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.baseUrl}/auth`;

  constructor(private http: HttpClient) {}

  logIn(signInData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, signInData);
  }

  logOut(sessionId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, { sessionId });
  }

  refreshToken(refreshToken: string): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/refresh-token`, { refreshToken });
  }
}
