import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {AvisModels} from "../models/avis.models";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  private apiUrl = `${environment.baseUrl}/avis`;
  constructor(private http: HttpClient) { }

  saveAvisForUser( avis: AvisModels) {
  return this.http.post<AvisModels>(`${this.apiUrl}/`, {
    ...avis,
  });
}


  getAvisById(id: number): Observable<AvisModels> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<AvisModels>(url);
  }

  getAvisByUserId(userId: number): Observable<AvisModels[]> {
    const url = `${this.apiUrl}/user/${userId}`;
    return this.http.get<AvisModels[]>(url);
  }

  getAllAvis(): Observable<AvisModels[]> {
    return this.http.get<AvisModels[]>(this.apiUrl);
  }

  deleteAvis(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
  getAvisByPartner(partnerId: number): Observable<AvisModels[]> {
  return this.http.get<AvisModels[]>(`${this.apiUrl}/partner/${partnerId}`);
}

 hasOldAvis(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/has-old-avis/${userId}`);
  }

}
