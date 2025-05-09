import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkersService {
  private apiUrl = `${environment.baseUrl}/workers`;
  private apiUrlu = `${environment.baseUrl}/users`;


  constructor(private http: HttpClient) { }

  getWorkerById(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<any>(url);
  }

  updateWorker(id: number, updatedWorker: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<any>(url, updatedWorker);
  }

  deleteWorker(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url);
  }

  getAllWorkers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlu);
  }

  createWorker(worker: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, worker);
  }

  getWorkerByEmail(email: string): Observable<any> {
    const url = `${this.apiUrl}/email/${email}`;
    return this.http.get<any>(url);
  }

  getWorkerByRole(role: string): Observable<any> {
    const url = `${this.apiUrl}/role/${role}`;
    return this.http.get<any>(url);
  }

  updateWorkerPassword(id: number, newPassword: string): Observable<any> {
    const url = `${this.apiUrl}/${id}/updatePassword`;
    const passwordData = { newPassword: newPassword };
    return this.http.put<any>(url, passwordData);
  }
}