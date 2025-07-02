import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Setting {
  id?: number;
  reclamationTarget?: number;
  // autres attributs si besoin
}

@Injectable({
  providedIn: 'root'
})
export class SettingService {
      private apiUrl = `${environment.baseUrl}/settings`;
    
  constructor(private http: HttpClient) {}

  getSettings(): Observable<Setting[]> {
    return this.http.get<Setting[]>(this.apiUrl);
  }

  updateSetting(id: number, changes: Partial<Setting>): Observable<Setting> {
    return this.http.patch<Setting>(`${this.apiUrl}/${id}`, changes);
  }
}
