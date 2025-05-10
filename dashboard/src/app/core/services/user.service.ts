import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/auth.models';

export interface CreateUserDto {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
}

export interface FindUsersDto {
  username?: string;
  email?: string;
  accountStatus?: string;
  roleId?: number;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/users'; // Adjust base URL

  constructor(private http: HttpClient) {}

  createUser(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, dto);
  }

  findUsers(filters: FindUsersDto): Observable<User[]> {
    let params = new HttpParams();
    if (filters.username) {
      params = params.set('username', filters.username);
    }
    if (filters.email) {
      params = params.set('email', filters.email);
    }
    if (filters.accountStatus) {
      params = params.set('accountStatus', filters.accountStatus);
    }
    if (filters.roleId !== undefined) {
      params = params.set('roleId', filters.roleId.toString());
    }
    return this.http.get<User[]>(this.apiUrl, { params });
  }

  getnameProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/nameprofile`);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
  getPermessionProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profilepermession`);
  }

  changePassword(dto: ChangePasswordDto): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/change-password`, dto);
  }

  updateUserRole(userId: number, roleId: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/role`, { roleId });
  }
}
