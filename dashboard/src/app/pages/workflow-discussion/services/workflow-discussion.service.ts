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

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });
  }

  getDiscussion(discussionId: number): Observable<WorkflowDiscussion> {
    return this.http.get<WorkflowDiscussion>(`${this.apiUrl}/${discussionId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error loading discussion', error);
        return throwError(() => new Error('Failed to load discussion'));
      })
    );
  }

  getAllDiscussions(): Observable<WorkflowDiscussion[]> {
    return this.http.get<WorkflowDiscussion[]>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error loading all discussions', error);
        return throwError(() => new Error('Failed to load discussions'));
      })
    );
  }

  getDiscussionsByUser(userId: number): Observable<WorkflowDiscussion[]> {
    return this.http.get<WorkflowDiscussion[]>(`${this.apiUrl}/user/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error loading user discussions', error);
        return throwError(() => new Error('Failed to load user discussions'));
      })
    );
  }

  addMessage(discussionId: number, content: string): Observable<WorkflowMessage> {
    return this.http.post<WorkflowMessage>(
      `${this.apiUrl}/${discussionId}/messages`,
      { content: content.trim() },
      { headers: this.getAuthHeaders() }
    );
  }

  transitionPhase(discussionId: number, targetPhase: WorkflowPhase, targetEntityId?: number): Observable<WorkflowDiscussion> {
    return this.http.post<WorkflowDiscussion>(
      `${this.apiUrl}/${discussionId}/transition`,
      { targetPhase, targetEntityId },
      { headers: this.getAuthHeaders() }
    );
  }
}
