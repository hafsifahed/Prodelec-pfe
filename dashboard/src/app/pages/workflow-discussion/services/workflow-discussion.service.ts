import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WorkflowDiscussion } from '../models/workflow-discussion.model';
import { WorkflowMessage } from '../models/workflow-message.model';
import { WorkflowPhase } from '../models/workflow-phase.model';
import { WorkflowDiscussionSidebar } from '../models/workflow-discussion-sidebar.model';

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

    getAllDiscussions(page = 1, limit = 20): Observable<WorkflowDiscussionSidebar[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<WorkflowDiscussionSidebar[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      params
    });
  }



  getDiscussionsByUser( page = 1, limit = 20): Observable<{discussions: WorkflowDiscussionSidebar[], total: number}> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{discussions: WorkflowDiscussionSidebar[], total: number}>(
      `${this.apiUrl}/my-discussions`,
      { headers: this.getAuthHeaders(), params }
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
getDiscussionsForSidebar(page = 1, limit = 20): Observable<WorkflowDiscussionSidebar[]> {
  return this.http.get<WorkflowDiscussionSidebar[]>(
    `${this.apiUrl}/all?page=${page}&limit=${limit}`,
    { headers: this.getAuthHeaders() }
  );
}
  
}
