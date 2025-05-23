import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CahierDesCharges } from '../../models/CahierDesCharges/cahier-des-charges';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { User } from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class CdcServiceService {
  constructor(private http: HttpClient) { }

  getAllCdc(){
    return this.http.get<CahierDesCharges[]>(`${environment.baseUrl}/cdc`);
  }
  getByIdUser( id:number){
    return this.http.get<CahierDesCharges[]>(`${environment.baseUrl}/cdc/user/${id}`);
  }
  getById(id:number){
    return this.http.get<CahierDesCharges>(`${environment.baseUrl}/cdc/${id}`);
  
  }
 addCdc(cdc:CahierDesCharges){
  return this.http.post(`${environment.baseUrl}/cdc`,cdc);
 }
 downloadFile(fileName: string , user : User): Observable<Blob> {
  let params = new HttpParams()
  .set('email', user.email);  // Assuming `email` is a property of `UserModel`

return this.http.get(`${environment.baseUrl}/cdc/download/${fileName}`, {
  responseType: 'blob',
  params: params
});

}
getFileUrl(fileName: string):  Observable<Blob>{
  return this.http.get(`${environment.baseUrl}/cdc/pdf/${fileName}`, { responseType: 'blob' });
}

uploadFile(file: File): Observable<string> {
  const formData: FormData = new FormData();
  formData.append('file', file, file.name);

  return this.http.post<string>(`${environment.baseUrl}/cdc/upload`, formData);
}
 acceptCdc(id:number){
    return this.http.put(`${environment.baseUrl}/cdc/accept/${id}`,null);
 } 
 archiver(id:number){
  return this.http.put(`${environment.baseUrl}/cdc/archiver/${id}`,null);
} 
Restorer(id:number){
  return this.http.put(`${environment.baseUrl}/cdc/restorer/${id}`,null);
} 
archiverU(id:number){
  return this.http.put(`${environment.baseUrl}/cdc/archiverU/${id}`,null);
} 
RestorerU(id:number){
  return this.http.put(`${environment.baseUrl}/cdc/restorerU/${id}`,null);
} 
  rejectCdc(id:number , commentaire:string){
    return this.http.put(`${environment.baseUrl}/cdc/refuse/${id}`,{commentaire});
  }

  deleteCdc(id:number){
    return this.http.delete(`${environment.baseUrl}/cdc/${id}`);
  }

}


