import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


interface EmailRequest {
  to: string[];
  subject: string;
  text: string;
}
@Injectable({
  providedIn: 'root'
})
export class EmailService {


  constructor(private http: HttpClient) { }


  sendEmail( to: string[],subject: string,text: string,): Observable<void> {

    const emailRequest = {
      to: to,
      subject: subject,
      text: text
    };
    return this.http.post<void>(`${environment.baseUrl}/cdc/send`,emailRequest );
  }

}
