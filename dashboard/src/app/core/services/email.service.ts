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

  sendEmail(to: string[], subject: string, text: string): Observable<void> {
    // Clean HTML to reduce size and remove unwanted styles
    const cleanHtml = this.cleanHtmlContent(text);

    const emailRequest = {
      to: to,
      subject: subject,
      text: cleanHtml
    };
    
    return this.http.post<void>(`${environment.baseUrl}/cdc/send`, emailRequest);
  }

  private cleanHtmlContent(html: string): string {
    // Simple HTML cleaning to remove excessive styles and classes
    return html
      // Remove inline styles
      .replace(/style="[^"]*"/g, '')
      // Remove classes
      .replace(/class="[^"]*"/g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }
}