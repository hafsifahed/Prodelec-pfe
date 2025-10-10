import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  private apiUrl = `${environment.baseUrl}/roles`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.error?.message) {
        // Si le serveur renvoie un tableau de messages
        if (Array.isArray(error.error.message)) {
          errorMessage = error.error.message.join(', ');
        } else {
          errorMessage = error.error.message;
        }
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = `Erreur ${error.status}: ${error.statusText}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  create(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role)
      .pipe(catchError(this.handleError));
  }

  findAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  findOne(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  update(id: number, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role)
      .pipe(catchError(this.handleError));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
}