import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {
  private apiUrl = `${environment.baseUrl}/user-session`;

  constructor(private http: HttpClient) { }

  startSession(userMail: string, ipAddress: string): Observable<any> {
    const params = new HttpParams()
        .set('userMail', userMail)
        .set('ipAddress', ipAddress);

    return this.http.post(`${this.apiUrl}/start`, null, { params });
  }

  endSession(sessionId: number): Observable<any> {
    const url = `${this.apiUrl}/end/${sessionId}`;
    return this.http.put(url, null);
  }

  getAllUserSessions(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getUserSessionById(sessionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${sessionId}`);
  }

  createUserSession(userSession: any): Observable<any> {
    return this.http.post(this.apiUrl, userSession);
  }

  updateUserSession(sessionId: number, userSession: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${sessionId}`, userSession);
  }

  deleteUserSession(sessionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${sessionId}`);
  }

  isSessionActive(sessionId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${sessionId}/active`);
  }
}