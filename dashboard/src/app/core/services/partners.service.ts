import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Partner } from '../models/partner.models';
import {PartnerEditDto} from "../models/partner-edit-dto";

@Injectable({
    providedIn: 'root'
})
export class PartnersService {
    private baseUrl = `${environment.baseUrl}/partners`;

    constructor(private http: HttpClient) {}

    getAllPartners(): Observable<Partner[]> {
        return this.http.get<Partner[]>(this.baseUrl);
    }

    getPartnerById(id: number): Observable<Partner> {
        const url = `${this.baseUrl}/${id}`;
        return this.http.get<Partner>(url);
    }

    getPartnerByUsersId(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/${userId}/partner`);
      }

    addPartner(partner: Partner): Observable<Partner> {
        return this.http.post<Partner>(this.baseUrl, partner);
    }

    updatePartner(id: number, partner: PartnerEditDto): Observable<Partner> {
        const url = `${this.baseUrl}/${id}`;
        return this.http.put<Partner>(url, partner);
    }

    deletePartner(id: number): Observable<void> {
        const url = `${this.baseUrl}/${id}`;
        return this.http.delete<void>(url);
    }
    
    getUsersByPartnerId(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/${userId}/usersp`);
      }

        inactivatePartner(partnerId: number): Observable<Partner> {
    return this.http.patch<Partner>(`${this.baseUrl}/${partnerId}/inactivate`, {});
  }

  activatePartner(partnerId: number): Observable<Partner> {
  return this.http.patch<Partner>(`${this.baseUrl}/${partnerId}/activate`, {});
}

}