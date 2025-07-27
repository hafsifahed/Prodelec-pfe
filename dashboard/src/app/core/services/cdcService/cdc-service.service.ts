import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CahierDesCharges } from '../../models/CahierDesCharges/cahier-des-charges';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { User } from '../../models/auth.models';

interface UploadResponse {
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class CdcServiceService {
  private readonly baseUrl = `${environment.baseUrl}/cdc`;

  constructor(private http: HttpClient) {}

  getAllCdc(): Observable<CahierDesCharges[]> {
    return this.http.get<CahierDesCharges[]>(this.baseUrl);
  }

  getByIdUser(userId: number): Observable<CahierDesCharges[]> {
    return this.http.get<CahierDesCharges[]>(`${this.baseUrl}/user/${userId}`);
  }

  getById(id: number): Observable<CahierDesCharges> {
    return this.http.get<CahierDesCharges>(`${this.baseUrl}/${id}`);
  }

  addCdc(cdc: Partial<CahierDesCharges>): Observable<CahierDesCharges> {
    return this.http.post<CahierDesCharges>(this.baseUrl, cdc);
  }

  downloadFile(fileName: string, user: User): Observable<Blob> {
    const params = new HttpParams().set('username', user.username);
    return this.http.get(`${this.baseUrl}/download/${encodeURIComponent(fileName)}`, {
      responseType: 'blob',
      params
    });
  }

  getFileUrl(fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/pdf/${encodeURIComponent(fileName)}`, { responseType: 'blob' });
  }

  uploadMultipleFiles(files: File[], username: string, cdcId?: number): Observable<UploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file, file.name));
    formData.append('username', username);
    if (cdcId !== undefined) {
      formData.append('cdcId', cdcId.toString());
    }
    return this.http.post<UploadResponse[]>(`${this.baseUrl}/upload-multiple`, formData);
  }

  acceptCdc(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/accept/${id}`, null);
  }

  archiver(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/archiver/${id}`, null);
  }

  restorer(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/restorer/${id}`, null);
  }

  archiverU(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/archiverU/${id}`, null);
  }

  restorerU(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/restorerU/${id}`, null);
  }

  rejectCdc(id: number, commentaire: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/refuse/${id}`, { commentaire });
  }

  deleteCdc(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
