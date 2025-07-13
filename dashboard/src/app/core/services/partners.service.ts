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
  private readonly baseImageUrl = `${environment.baseUrl}/uploads/partners`;
  private readonly defaultImageUrl = 'assets/images/companies/img-6.png';
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

    addPartner(partner: any, image?: File): Observable<Partner> {
  const formData = new FormData();
  formData.append('name', partner.name);
  formData.append('address', partner.address);
  formData.append('tel', partner.tel);

  // Si vous envoyez les utilisateurs, adaptez ici (exemple JSON stringifié)
  if (partner.users) {
    formData.append('users', JSON.stringify(partner.users));
  }

  // Ajout conditionnel de l'image uniquement si elle existe
  if (image) {
    formData.append('image', image);
  }

  return this.http.post<Partner>(this.baseUrl, formData);
}


updatePartner(id: number, partner: PartnerEditDto, image?: File): Observable<Partner> {
  const formData = new FormData();
  formData.append('name', partner.name);
  formData.append('address', partner.address);
  formData.append('tel', partner.tel);

  if (image) {
    formData.append('image', image);
  }

  return this.http.put<Partner>(`${this.baseUrl}/${id}`, formData);
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

 getPartnerImageUrl(partner: Partner): string {
    if (partner.image) {
      return `${this.baseImageUrl}/${partner.image}`;
    }
    return this.defaultImageUrl;
  }
}