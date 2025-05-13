import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/auth.models';
import { UpdateUserFullDto } from '../models/update-user-full.dto';

export interface CreateUserDto {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  partnerId:number;
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

export interface SetPasswordDto {
  newPassword: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AccountStatusDto {
  status: 'active' | 'inactive' | 'suspended';
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/users'; // Adjust base URL

  constructor(private http: HttpClient) {}

  // Create a new user
  createUser(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, dto);
  }

  createUserBy(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/by`, dto);
  }

  // Find users with optional filters
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

  // Get current user's profile
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  // Get current user's name profile
  getNameProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/nameprofile`);
  }

  // Get current user's permissions/profile info
  getPermissionProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profilepermession`);
  }

  // Change current user's password (requires current password)
  changePassword(dto: ChangePasswordDto): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/change-password`, dto);
  }

  // Update user role (admin only)
  updateUserRole(userId: number, roleId: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/role`, { roleId });
  }

  // Update user account status (active, inactive, suspended)
  updateAccountStatus(userId: number, statusDto: AccountStatusDto): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/status`, statusDto);
  }

  // Update user details (firstName, lastName, email)
  updateUser(userId: number, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, dto);
  }

  // Search users by keyword (searches firstName, lastName, username, email)
  searchUsers(keyword: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('q', keyword),
    });
  }

  // Admin: Set user password without current password verification
  setPassword(userId: number, dto: SetPasswordDto): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${userId}/set-password`, dto);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/byid/${userId}`);
  }
  
  updateUserFull(userId: number, dto: UpdateUserFullDto): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/full`, dto);
  }
  
  
}
