import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Devis } from '../../models/Devis/devis';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DevisService {

  constructor(private http: HttpClient) { }

  getAlldevis(){
    return this.http.get<Devis[]>(`${environment.baseUrl}/devis`);
  }
  getByIdUser( id:number){
    return this.http.get<Devis[]>(`${environment.baseUrl}/devis/user/${id}`);
  }
  getById(id:number){
    return this.http.get<Devis>(`${environment.baseUrl}/devis/${id}`);
  
  }
  // addDevis(devis: Devis){
  //   return this.http.post(`${environment.baseUrl}/devis`,devis);
  //  }

  /*saveDevis(cahierDesChargesId: number, pieceJointe: string): Observable<Devis> {
  return this.http.post<Devis>(`${environment.baseUrl}/devis/${cahierDesChargesId}`, { pieceJointe });
}*/

saveDevis(cahierDesChargesId: number, pieceJointe: string, numdevis: string): Observable<Devis> {
  return this.http.post<Devis>(
    `${environment.baseUrl}/devis/${cahierDesChargesId}`,
    { pieceJointe, numdevis }
  );
}

 downloadFile(fileName: string): Observable<Blob> {
  return this.http.get(`${environment.baseUrl}/devis/download/${fileName}`, { responseType: 'blob' });
}

uploadFile(file: File): Observable<string> {
  const formData: FormData = new FormData();
  formData.append('file', file, file.name);

  return this.http.post<string>(`${environment.baseUrl}/devis/upload`, formData);
}
 acceptdevis(id:number){
    return this.http.put(`${environment.baseUrl}/devis/accept/${id}`,null);
 } 

  rejectdevis(id:number , commentaire:string){
    return this.http.put(`${environment.baseUrl}/devis/refuse/${id}`,{commentaire});
  }

  archiver(id:number){
    return this.http.put(`${environment.baseUrl}/devis/archiver/${id}`,null);
  } 
  Restorer(id:number){
    return this.http.put(`${environment.baseUrl}/devis/restorer/${id}`,null);
  } 
  
  archiverU(id:number){
    return this.http.put(`${environment.baseUrl}/devis/archiverU/${id}`,null);
  } 
  RestorerU(id:number){
    return this.http.put(`${environment.baseUrl}/devis/restorerU/${id}`,null);
  } 
  deleteDevis(id:number){
    return this.http.delete(`${environment.baseUrl}/devis/${id}`);
  }
  getFileUrl(fileName: string):  Observable<Blob>{
    return this.http.get(`${environment.baseUrl}/devis/pdf/${fileName}`, { responseType: 'blob' });
  }

  // dans votre service Angular
negocierDevis(id: number, commentaire: string): Observable<Devis> {
  return this.http.put<Devis>(`${environment.baseUrl}/negocier/${id}`, { commentaire });
}

}
