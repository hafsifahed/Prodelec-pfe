import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from './websocket.service';
import { NotificationModels } from '../models/notification.models';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = new BehaviorSubject<NotificationModels[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  public notifications$ = this.notifications.asObservable();
  public unreadCount$ = this.unreadCount.asObservable();

  private apiUrl = `${environment.baseUrl}/notifications`; // adapte selon ton backend
  

  constructor(private websocketService: WebsocketService, private http: HttpClient) {
    // Écoute des notifications en temps réel via WebSocket
    this.websocketService.listenForNotifications(notification => {
      this.addNotification(notification);
    });

    // Charger les notifications initiales depuis l'API
    this.getNotifications().subscribe(notifs => {
      this.notifications.next(notifs);
      this.unreadCount.next(notifs.filter(n => !n.read).length);
    });
  }

  private addNotification(notification: NotificationModels) {
    const current = this.notifications.value;
    this.notifications.next([notification, ...current]);
    this.unreadCount.next(this.unreadCount.value + 1);
  }

  // Récupérer toutes les notifications via API REST
  getNotifications(): Observable<NotificationModels[]> {
    return this.http.get<NotificationModels[]>(this.apiUrl);
  }

  // Récupérer toutes les notifications via API REST
  getNotificationsMe(): Observable<NotificationModels[]> {
    return this.http.get<NotificationModels[]>(`${this.apiUrl}/me`);
  }

  // Supprimer une notification par son id
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }

  // Marquer une notification comme lue via API REST et mise à jour locale
  markNotificationAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-read`, { id: notificationId });
  }

  // Méthode pour mettre à jour localement après marquage comme lu (optionnel)
  updateNotificationAsReadLocally(notificationId: number) {
    const current = this.notifications.value.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notifications.next(current);
    this.unreadCount.next(current.filter(n => !n.read).length);
  }
}
