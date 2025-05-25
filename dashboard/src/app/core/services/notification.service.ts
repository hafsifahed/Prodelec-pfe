import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebsocketService } from './websocket.service';
import { NotificationModels } from '../models/notification.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = new BehaviorSubject<NotificationModels[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  public notifications$ = this.notifications.asObservable();
  public unreadCount$ = this.unreadCount.asObservable();

  constructor(private websocketService: WebsocketService) {
    this.websocketService.listenForNotifications(notification => {
      this.addNotification(notification);
    });
  }

  private addNotification(notification: NotificationModels) {
    const current = this.notifications.value;
    this.notifications.next([notification, ...current]);
    this.unreadCount.next(this.unreadCount.value + 1);
  }

  markAsRead(notificationId: number) {
    // Appeler l'API backend pour marquer comme lu
    this.unreadCount.next(Math.max(0, this.unreadCount.value - 1));
  }
}
