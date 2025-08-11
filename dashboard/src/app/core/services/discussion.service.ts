// src/app/core/services/discussion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

export interface Message {
  id: number;
  content: string;
  sender: User;
  createdAt: string;
  discussionId: number;
}

export interface Discussion {
  id: number;
  cahierDesCharges?: any;
  devis?: any;
  order?: any;
  project?: any;
  messages: Message[];
}

@Injectable({
  providedIn: 'root',
})
export class DiscussionService {
    
  private baseUrl = `${environment.baseUrl}/discussion`; // Ajustez selon votre config

  constructor(private http: HttpClient) {}

  // Récupérer la discussion complète par id (messages, entities liées)
  getDiscussion(id: number): Observable<Discussion> {
    return this.http.get<Discussion>(`${this.baseUrl}/${id}`);
  }

  // discussion.service.ts
getDiscussionDetails(discussionId: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/${discussionId}/details`);
}
}
