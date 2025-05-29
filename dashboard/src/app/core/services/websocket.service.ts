// websocket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { NotificationModels } from '../models/notification.models';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket: Socket;
  private notificationsSubject = new BehaviorSubject<NotificationModels[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
    public url =`${environment.baseUrl}`

  constructor() {
    this.socket = io(this.url, {
      auth: { token: localStorage.getItem('token') }
    });

    this.socket.on('notification', (notification: NotificationModels) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
    });

    // Optionnel : charger les notifications non lues à la connexion
    this.socket.on('initial_notifications', (notifs: NotificationModels[]) => {
      this.notificationsSubject.next(notifs);
    });
  }

  markAsRead(notificationId: number) {
    this.socket.emit('markAsRead', notificationId);
    // Optionnel : mettre à jour localement
    const current = this.notificationsSubject.value.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(current);
  }

   listenForNotifications(callback: (notification: NotificationModels) => void): void {
    this.socket.on('notification', (notification: NotificationModels) => {
      callback(notification);
    });
  }
}
