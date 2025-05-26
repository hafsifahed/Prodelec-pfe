import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationModels } from '../../core/models/notification.models';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-list-notifications',
  templateUrl: './list-notifications.component.html',
  styleUrls: ['./list-notifications.component.scss']
})
export class ListNotificationsComponent implements OnInit {
  notifications: NotificationModels[] = [];
  p: number = 1; // page courante
  itemsPerPage: number = 5; // éléments par page
  user: any;
  searchNotification: string = '';
  errorMessage: string;

  constructor(
    private notificationService: NotificationService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit(): void {
    // Récupérer l'utilisateur connecté
    this.userStateService.user$.subscribe(user => {
      this.user = user;
      this.loadNotifications();
    });
  }

  loadNotifications(): void {
    this.notificationService.getNotificationsMe().subscribe({
      next: (notifications) => this.notifications = notifications,
      error: (err) => this.errorMessage = err
    });
  }

  deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
      },
      error: (err) => console.error(err)
    });
  }

  markNotificationAsRead(notificationId: number): void {
    this.notificationService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        const notif = this.notifications.find(n => n.id === notificationId);
        if (notif) {
          notif.read = true;
        }
      },
      error: (err) => console.error(err)
    });
  }

  searchNotificationBy(): void {
    if (this.searchNotification.trim() === '') {
      this.loadNotifications();
    } else {
      const search = this.searchNotification.toLowerCase();
      this.notifications = this.notifications.filter(n =>
        (n.createdBy?.toLowerCase().includes(search)) ||
        (n.title?.toLowerCase().includes(search)) ||
        (n.message?.toLowerCase().includes(search))
      );
    }
  }
}
