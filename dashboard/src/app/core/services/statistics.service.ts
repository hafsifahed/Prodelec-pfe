// src/app/core/services/statistics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/* ──────────────────────────  Interfaces  ────────────────────────── */

/** Même structure que le DTO renvoyé par le backend */
export interface GlobalStats {
  /* Cartes Commandes / Projets */
  totalOrders       : number;
  cancelledOrders   : number;
  totalProjects     : number;
  completedProjects : number;
  lateProjects      : number;

  /* Avis & ratio réclamations / projets */
  averageAvis       : number;
  reclamationRatio  : number;

  /* Sessions */
  sessions: {
    totalEmployees     : number;
    connectedEmployees : number;
    totalClients       : number;
    connectedClients   : number;
  };
}

/* Exemple de payloads retournés par les endpoints de détails
   (à ajuster si nécessaire dans vos contrôleurs Nest). */
export interface PieStats {
  series : number[];   // valeurs numériques
  labels : string[];   // libellés
}

@Injectable({ providedIn: 'root' })
export class StatisticsService {

  private readonly baseUrl = `${environment.baseUrl}/statistics`;

  constructor(private http: HttpClient) {}

  /* =======================================================================
   *  1.  STATISTIQUES GLOBALES (tableau de bord)
   * ===================================================================== */
  /** Renvoie l’objet GlobalStats utilisé par DashboardComponent */
  getGlobalStats(): Observable<GlobalStats> {
    // côté Nest : @Get('global') ou simplement @Get() dans StatisticsController
    return this.http.get<GlobalStats>(`${this.baseUrl}/global`);
  }

  /* =======================================================================
   *  2.  CHARTS – Réclamations / CDC / Devis / Projets
   * ===================================================================== */

  /** Réclamations (filtres facultatifs) */
  getReclamationStats(userId?: number, year?: number): Observable<PieStats> {
    const params = this.buildParams({ userId, year });
    return this.http.get<PieStats>(`${this.baseUrl}/reclamations`, { params });
  }

  /** Cahiers des charges */
  getCdcStats(userId?: number, year?: number): Observable<PieStats> {
    const params = this.buildParams({ userId, year });
    return this.http.get<PieStats>(`${this.baseUrl}/cahier-des-charges`, { params });
  }

  /** Devis */
  getDevisStats(userId?: number, year?: number): Observable<PieStats> {
    const params = this.buildParams({ userId, year });
    return this.http.get<PieStats>(`${this.baseUrl}/devis`, { params });
  }

  /** Projets (livré / retard) – pas de filtres côté client */
  getProjectStats(): Observable<PieStats> {
    return this.http.get<PieStats>(`${this.baseUrl}/projects`);
  }

  /* =======================================================================
   *  3.  DROPDOWNS (listes utilisateurs / années)
   * ===================================================================== */

  /** Tous les utilisateurs (pour listes déroulantes) */
  getUsers(): Observable<{ id: number; email: string }[]> {
    return this.http.get<{ id: number; email: string }[]>(`${this.baseUrl}/users`);
  }

  /** Utilisateurs n’ayant au moins un CDC (si endpoint dédié) */
  getUsersWithCdc(): Observable<{ id: number; email: string }[]> {
    return this.http.get<{ id: number; email: string }[]>(`${this.baseUrl}/users-cdc`);
  }

  /* =======================================================================
   *  4.  OUTIL PRIVÉ – construction des query params
   * ===================================================================== */
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
