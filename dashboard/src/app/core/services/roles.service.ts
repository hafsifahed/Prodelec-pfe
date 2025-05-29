import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  id?: number;
  name: string;
  permissions: Permission[];
  isSystemRole?: boolean;
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private apiUrl = `${environment.baseUrl}/roles`; // Adjust if needed

  constructor(private http: HttpClient) {}

  create(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  findAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  findOne(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  update(id: number, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
