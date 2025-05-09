import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkerSessionService {
  private apiUrl = `${environment.baseUrl}/worker-sessions`;

  constructor(private http: HttpClient) { }

  startSession(userMail: string, ipAddress: string): Observable<any> {
    const params = new HttpParams()
        .set('workerMail', userMail)
        .set('ipAddress', ipAddress);

    return this.http.post(`${this.apiUrl}/start`, null, { params });
  }

  endSession(sessionId: number): Observable<any> {
    const url = `${this.apiUrl}/end?sessionId=${sessionId}`;
    return this.http.post(url, null);
  }

  getAllWorkerSessions(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getWorkerSessionById(sessionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${sessionId}`);
  }

  createWorkerSession(workerSession: any): Observable<any> {
    return this.http.post(this.apiUrl, workerSession);
  }

  updateWorkerSession(sessionId: number, workerSession: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${sessionId}`, workerSession);
  }

  deleteWorkerSession(sessionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${sessionId}`);
  }

  isSessionActive(sessionId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${sessionId}/active`);
  }
}