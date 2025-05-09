import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";
import {NotificationModels} from "../models/notification.models";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.baseUrl}/notifications`; // Replace with your API endpoint URL

  constructor(private http: HttpClient) { }

  getNotifications(): Observable<NotificationModels[]> {
    return this.http.get<NotificationModels[]>(this.apiUrl);
  }

  getNotificationsByUserId(userId: number): Observable<NotificationModels[]> {
    const url = `${this.apiUrl}/users/${userId}`;
    return this.http.get<NotificationModels[]>(url);
  }

  getNotificationsByWorkerId(workerId: number): Observable<NotificationModels[]> {
    const url = `${this.apiUrl}/workers/${workerId}`;
    return this.http.get<NotificationModels[]>(url);
  }

  createNotificationForUser(notification: NotificationModels, userId: number): Observable<NotificationModels> {
    const url = `${this.apiUrl}/users/${userId}`;
    return this.http.post<NotificationModels>(url, notification);
  }

  createNotificationForWorker(notification: NotificationModels, workerId: number): Observable<NotificationModels> {
    const url = `${this.apiUrl}/workers/${workerId}`;
    return this.http.post<NotificationModels>(url, notification);
  }

  updateNotification(notification: NotificationModels): Observable<NotificationModels> {
    const url = `${this.apiUrl}/${notification.id}`;
    return this.http.put<NotificationModels>(url, notification);
  }

  deleteNotification(notificationId: number): Observable<void> {
    const url = `${this.apiUrl}/${notificationId}`;
    return this.http.delete<void>(url);
  }

  markNotificationAsRead(notificationId: number): Observable<NotificationModels> {
    const url = `${this.apiUrl}/${notificationId}/read`;
    return this.http.put<NotificationModels>(url, {});
  }

  getNotificationById(notificationId: number): Observable<NotificationModels> {
    const url = `${this.apiUrl}/${notificationId}`;
    return this.http.get<NotificationModels>(url);
  }
}