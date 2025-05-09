import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { Reclamation } from '../../models/reclamation';
import { Observable } from 'rxjs';
import { UserModel } from '../../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {

  constructor(private http: HttpClient) { }

  getAllreclamation(){
    return this.http.get<Reclamation[]>(`${environment.baseUrl}/reclamation`);
  }
  getByIdUser( id:number){
    return this.http.get<Reclamation[]>(`${environment.baseUrl}/reclamation/user/${id}`);
  }
  getById(id:number){
    return this.http.get<Reclamation>(`${environment.baseUrl}/reclamation/${id}`);
  
  }
 addreclamation(reclamation:Reclamation){
  return this.http.post(`${environment.baseUrl}/reclamation`,reclamation);
 }
 archiver(id:number){
  return this.http.put(`${environment.baseUrl}/reclamation/archiver/${id}`,null);
} 
Restorer(id:number){
  return this.http.put(`${environment.baseUrl}/reclamation/restorer/${id}`,null);
} 
archiverU(id:number){
  return this.http.put(`${environment.baseUrl}/reclamation/archiverU/${id}`,null);
} 
RestorerU(id:number){
  return this.http.put(`${environment.baseUrl}/reclamation/restorerU/${id}`,null);
} 

downloadFile(fileName: string , user : UserModel): Observable<Blob> {
  let params = new HttpParams()
  .set('email', user.email);  // Assuming `email` is a property of `UserModel`

return this.http.get(`${environment.baseUrl}/reclamation/download/${fileName}`, {
  responseType: 'blob',
  params: params
});

}

uploadFile(file: File): Observable<string> {
  const formData: FormData = new FormData();
  formData.append('file', file, file.name);

  return this.http.post<string>(`${environment.baseUrl}/reclamation/upload`, formData);
}
deleteRec(id:number){
  return this.http.delete(`${environment.baseUrl}/reclamation/${id}`);
}
traiterRec(id:number , reponse:string){
  return this.http.put(`${environment.baseUrl}/reclamation/traiter/${id}`,{reponse});
}
}
