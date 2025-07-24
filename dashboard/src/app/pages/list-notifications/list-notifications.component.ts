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
  filteredNotifications: NotificationModels[] = [];
  p: number = 1;
  itemsPerPage: number = 10;
  user: any;
  searchNotification: string = '';
  filterStatus: string = 'all';
  errorMessage: string;
  title = 'Notifications';
  isLoading: boolean = false;

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Notifications', active: true }
  ];

  constructor(
    private notificationService: NotificationService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
      this.user = user;
      this.loadNotifications();
    });
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotificationsMe().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err;
        this.isLoading = false;
      }
    });
  }

  deleteNotification(notificationId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      this.notificationService.deleteNotification(notificationId).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.applyFilters();
        },
        error: (err) => console.error(err)
      });
    }
  }

  markNotificationAsRead(notificationId: number): void {
    this.notificationService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        const notif = this.notifications.find(n => n.id === notificationId);
        if (notif) {
          notif.read = true;
          this.applyFilters();
        }
      },
      error: (err) => console.error(err)
    });
  }

  markAllAsRead(): void {
  /*  const unreadIds = this.notifications
      .filter(n => !n.read)
      .map(n => n.id);
    
    if (unreadIds.length === 0) return;

    this.notificationService.markAllAsRead(unreadIds).subscribe({
      next: () => {
        this.notifications.forEach(n => {
          if (!n.read) n.read = true;
        });
        this.applyFilters();
      },
      error: (err) => console.error(err)
    });*/
  }

  searchNotificationBy(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.notifications];

    // Filtre par statut
    if (this.filterStatus === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (this.filterStatus === 'read') {
      filtered = filtered.filter(n => n.read);
    }

    // Filtre par recherche
    if (this.searchNotification.trim() !== '') {
      const search = this.searchNotification.toLowerCase();
      filtered = filtered.filter(n =>
        (n.createdBy?.toLowerCase().includes(search)) ||
        (n.title?.toLowerCase().includes(search)) ||
        (n.message?.toLowerCase().includes(search))
      );
    }

    this.filteredNotifications = filtered;
    this.p = 1; // Reset à la première page après filtrage
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getNotificationIcon(notification: NotificationModels): string {
    // Vous pouvez personnaliser les icônes en fonction du type de notification
    return notification.read ? 'fa-check-circle' : 'fa-bell';
  }

  handleNotificationClick(notification: NotificationModels): void {
    if (!notification.read) {
      this.markNotificationAsRead(notification.id);
    }
    // Ajoutez ici la logique pour naviguer vers la page concernée par la notification
  }
}