// charts-statistics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ChartsFilters {
  userId?: number;
  partnerId?: number;
  year?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChartsStatisticsService {
    private apiUrl = `${environment.baseUrl}/charts-statistics`; // Ajustez selon votre config
  

  constructor(private http: HttpClient) {}

  getFilterOptions(partnerId?: number): Observable<any> {
  let params = new HttpParams();
  if (partnerId) {
    params = params.set('partnerId', partnerId.toString());
  }
  return this.http.get(`${this.apiUrl}/filters`, { params });
}

getChartsStatistics(filters: any): Observable<any> {
  let params = new HttpParams();
  if (filters.userId) params = params.set('userId', filters.userId.toString());
  if (filters.partnerId) params = params.set('partnerId', filters.partnerId.toString());
  if (filters.year) params = params.set('year', filters.year.toString());
  if (filters.includeAi) params = params.set('includeAi', filters.includeAi.toString());

  
  return this.http.get(`${this.apiUrl}`, { params });
}

  private buildParams(filters: ChartsFilters): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    
    if (filters.userId) params['userId'] = filters.userId.toString();
    if (filters.partnerId) params['partnerId'] = filters.partnerId.toString();
    if (filters.year) params['year'] = filters.year.toString();

    return params;
  }
}