// workflow-discussion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WorkflowDiscussion } from '../models/workflow-discussion.model';
import { WorkflowMessage } from '../models/workflow-message.model';
import { WorkflowPhase } from '../models/workflow-phase.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowDiscussionService {
  private apiUrl = `${environment.baseUrl}/workflow-discussions`;

  constructor(private http: HttpClient) {}

  getDiscussion(discussionId: number): Observable<WorkflowDiscussion> {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
  });

  return this.http.get<WorkflowDiscussion>(`${this.apiUrl}/${discussionId}`, { headers }).pipe(
    catchError(error => {
      console.error('Error loading discussion', error);
      return throwError(() => new Error('Failed to load discussion'));
    })
  );
}

  addMessage(discussionId: number, content: string): Observable<WorkflowMessage> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });

    return this.http.post<WorkflowMessage>(
      `${this.apiUrl}/${discussionId}/messages`,
      { content: content.trim() },
      { headers }
    );
  }

  transitionPhase(discussionId: number, targetPhase: WorkflowPhase, targetEntityId?: number): Observable<WorkflowDiscussion> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });

    return this.http.post<WorkflowDiscussion>(
      `${this.apiUrl}/${discussionId}/transition`,
      { targetPhase, targetEntityId },
      { headers }
    );
  }
}