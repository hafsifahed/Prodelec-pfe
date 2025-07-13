import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from '../models/auth.models';
import { UpdateUserFullDto } from '../models/update-user-full.dto';
import { environment } from 'src/environments/environment';

export interface CreateUserDto {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  image?:string;
  roleId: number;
  partnerId:number;
}

export interface UserSessionStats {
  totalEmployees: number;
  connectedEmployees: number;
  totalClients: number;
  connectedClients: number;
}


export interface FindUsersDto {
  username?: string;
  email?: string;
    image?:string;
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
  image?:string;
  email?: string;
}

export interface AccountStatusDto {
  status: 'active' | 'inactive' | 'suspended';
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.baseUrl}/users`; // Adjust base URL

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

  getAllUsers() : Observable<any[]>  {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
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

   getUserSessionStats(): Observable<UserSessionStats> {
    return this.http.get<UserSessionStats>(`${this.apiUrl}/stats/users-sessions`);
  }

  getClientRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles/client`);
  }

   getWorkerRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles/worker`);
  }

    // Liste des workers
  getWorkers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/workers`);
  }

  // Liste des clients
  getClients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/clients`);
  }

     uploadImage(file: File): Observable<{ progress: number; body?: any }> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.apiUrl}/upload-image`, formData, {
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            return { progress: event.total ? Math.round((event.loaded / event.total) * 100) : 0 };
          case HttpEventType.Response:
            return { progress: 100, body: event.body };
          default:
            return { progress: 0 };
        }
      })
    );
  }
  

getUserImageUrl(user: User): string {
console.log('sddsd',user.image)
  return user.image
    ? `${environment.baseUrl}/uploads/users/ProfileImages/${user.image}`
    : 'assets/images/companies/img-6.png'; // image par défaut locale
}

  
}
