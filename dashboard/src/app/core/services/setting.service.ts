import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Interface complète correspondant à l'entité Setting côté backend
export interface Setting {
  id?: number;
  reclamationTarget?: number;
  reclamationEmails?: string[];
  avisEmails?: string[];
  devisEmails?: string[];
  cahierDesChargesEmails?: string[];
  globalEmails?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private apiUrl = `${environment.baseUrl}/settings`;

  constructor(private http: HttpClient) {}

  // Récupérer la configuration (supposée unique, id=1)
  getSettings(): Observable<Setting> {
    return this.http.get<Setting>(`${this.apiUrl}/`);
  }

  // Mettre à jour partiellement la configuration
  updateSetting(id: number, changes: Partial<Setting>): Observable<Setting> {
    return this.http.patch<Setting>(`${this.apiUrl}/${id}`, changes);
  }
}
