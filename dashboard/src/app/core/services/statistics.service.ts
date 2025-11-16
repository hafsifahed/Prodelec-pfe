// src/app/core/services/statistics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SearchResults {
  projects: any[];
  devis: any[];
  partners: any[];
}

export interface GlobalStats {
  totalOrders: number;
  cancelledOrders: number;
  totalProjects: number;
  completedProjects: number;
  lateProjects: number;
  averageAvis: number;
  reclamationRatio: number;
  totalAvis: number;
  newOrders?: number;
  newProjects?: number;
  sessions?: {
    totalEmployees: number;
    connectedEmployees: number;
    totalClients: number;
    connectedClients: number;
  };
  aiAnalysis?: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    overallScore: number;
  };
}

export interface PeriodStats {
  period: string;
  data: GlobalStats;
  comparison?: {
    previousPeriod: string;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface PieStats {
  series: number[];
  labels: string[];
}

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly baseUrl = `${environment.baseUrl}/statistics`;

  constructor(private http: HttpClient) {}

   getAvailableYears(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/years`);
  }



   getGlobalStats(period: string, year?: number,includeAi?: boolean): Observable<GlobalStats> {
    let params = new HttpParams().set('period', period);
    if (year) {
      params = params.set('year', year.toString());
    }
    if (includeAi) {
      params = params.set('includeAi', 'true');
    }
    return this.http.get<GlobalStats>(`${this.baseUrl}/global`, { params });
  }
  // Statistiques comparatives

   getComparativeStats(period: string, year?: number): Observable<PeriodStats> {
    let params = new HttpParams().set('period', period);
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<PeriodStats>(`${this.baseUrl}/comparative`, { params });
  }

  // Méthodes existantes avec support des périodes
  getReclamationStats(period: string = 'month', userId?: number, year?: number): Observable<PieStats> {
    let params = this.buildParams({ period, userId, year });
    return this.http.get<PieStats>(`${this.baseUrl}/reclamations`, { params });
  }

  getCdcStats(period: string = 'month', userId?: number, year?: number): Observable<PieStats> {
    let params = this.buildParams({ period, userId, year });
    return this.http.get<PieStats>(`${this.baseUrl}/cahier-des-charges`, { params });
  }

  getDevisStats(period: string = 'month', userId?: number, year?: number): Observable<PieStats> {
    let params = this.buildParams({ period, userId, year });
    return this.http.get<PieStats>(`${this.baseUrl}/devis`, { params });
  }

  getProjectStats(period: string = 'month'): Observable<PieStats> {
    const params = this.buildParams({ period });
    return this.http.get<PieStats>(`${this.baseUrl}/projects`, { params });
  }

  // Méthodes existantes
  getUsers(): Observable<{ id: number; email: string }[]> {
    return this.http.get<{ id: number; email: string }[]>(`${this.baseUrl}/users`);
  }

  getUsersWithCdc(): Observable<{ id: number; email: string }[]> {
    return this.http.get<{ id: number; email: string }[]>(`${this.baseUrl}/users-cdc`);
  }

  search(keyword: string): Observable<SearchResults> {
    let params = new HttpParams();
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<SearchResults>(`${this.baseUrl}/search`, { params });
  }

  private buildParams(obj: Record<string, any>): HttpParams {
    let params = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, v.toString());
      }
    });
    return params;
  }
}