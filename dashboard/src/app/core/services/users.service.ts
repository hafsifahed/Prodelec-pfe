import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { environment } from '../../../environments/environment';
import {UserModel} from "../models/user.models";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.baseUrl}/userss`;

  constructor(private http: HttpClient) { }

  getUserById(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<any>(url);
  }

  updateUser(id: number, updatedUser: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<any>(url, updatedUser);
  }

  deleteUser(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<any>(url);
  }

  getAllUsers() : Observable<any[]>  {
    return this.http.get<any[]>(this.apiUrl);
  }

  createUser(user: UserModel, partnerId: number): Observable<UserModel> {
    const url = `${this.apiUrl}/create?partnerId=${partnerId}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<UserModel>(url, user, httpOptions)
        .pipe(
            catchError(this.handleError)
        );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error.message || 'Server error');
  }

  getUserByEmail(email: string): Observable<any> {
    const url = `${this.apiUrl}/email/${email}`;
    return this.http.get<any>(url);
  }

  updateUserPassword(id: number, newPassword: string): Observable<any> {
    const url = `${this.apiUrl}/${id}/updatePassword`;
    const passwordData = { newPassword: newPassword }; // Ensure the key is 'newPassword'
    return this.http.put<any>(url, passwordData);
  }
}