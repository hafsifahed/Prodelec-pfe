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
  constructor(private http: HttpClient) {}

  getAllCdc(): Observable<CahierDesCharges[]> {
    return this.http.get<CahierDesCharges[]>(`${environment.baseUrl}/cdc`);
  }

  getByIdUser(id: number): Observable<CahierDesCharges[]> {
    return this.http.get<CahierDesCharges[]>(`${environment.baseUrl}/cdc/user/${id}`);
  }

  getById(id: number): Observable<CahierDesCharges> {
    return this.http.get<CahierDesCharges>(`${environment.baseUrl}/cdc/${id}`);
  }

  addCdc(cdc: any): Observable<CahierDesCharges> {
    return this.http.post<CahierDesCharges>(`${environment.baseUrl}/cdc`, cdc);
  }

  downloadFile(fileName: string, user: User): Observable<Blob> {
    const params = new HttpParams().set('email', user.email);
    return this.http.get(`${environment.baseUrl}/cdc/download/${fileName}`, {
      responseType: 'blob',
      params
    });
  }

  getFileUrl(fileName: string): Observable<Blob> {
    return this.http.get(`${environment.baseUrl}/cdc/pdf/${fileName}`, { responseType: 'blob' });
  }

  // Correction ici : retour d'un objet { filename: string }
  uploadFile(file: File,username:string): Observable<UploadResponse> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
        formData.append('username', username);

    return this.http.post<UploadResponse>(`${environment.baseUrl}/cdc/upload`, formData);
  }

  acceptCdc(id: number): Observable<void> {
    return this.http.put<void>(`${environment.baseUrl}/cdc/accept/${id}`, null);
  }

  archiver(id: number): Observable<void> {
    return this.http.put<void>(`${environment.baseUrl}/cdc/archiver/${id}`, null);
  }

  restorer(id: number): Observable<void> {
    return this.http.put<void>(`${environment.baseUrl}/cdc/restorer/${id}`, null);
  }

  archiverU(id: number): Observable<void> {
    return this.http.put<void>(`${environment.baseUrl}/cdc/archiverU/${id}`, null);
  }

  restorerU(id: number): Observable<void> {
    return this.http.put<void>(`${environment.baseUrl}/cdc/restorerU/${id}`, null);
  }

  rejectCdc(id: number, commentaire: string): Observable<void> {
    return this.http.put<void>(`${environment.baseUrl}/cdc/refuse/${id}`, { commentaire });
  }

  deleteCdc(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.baseUrl}/cdc/${id}`);
  }
}
