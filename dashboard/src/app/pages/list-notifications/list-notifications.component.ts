import { Component, OnInit } from '@angular/core';
import {NotificationService} from "../../core/services/notification.service";
import {NotificationModels} from "../../core/models/notification.models";
import {WorkersService} from "../../core/services/workers.service";
import {UsersService} from "../../core/services/users.service";

@Component({
  selector: 'app-list-notifications',
  templateUrl: './list-notifications.component.html',
  styleUrls: ['./list-notifications.component.scss']
})
export class ListNotificationsComponent implements OnInit {
  notifications: NotificationModels[];
    p: number = 1; // Current page number
    itemsPerPage: number = 5; // Number of items per page
    user: any;
    userType: string | null = '';
    searchNotification: string = '';

    private errorMessage: string;


  constructor(private notificationService: NotificationService,
              private usersService: UsersService,
              private workersService: WorkersService) { }

  ngOnInit(): void {
    this.getNotifications();

      this.userType = localStorage.getItem('userType');
      const userEmail = localStorage.getItem('userMail');

      if (this.userType && userEmail) {
          if (this.userType === 'user') {
              this.fetchUserProfile(userEmail);
          } else if (this.userType === 'worker') {
              this.fetchWorkerProfile(userEmail);
          } else {
              this.errorMessage = 'Invalid user type.';
          }
      } else {
          this.errorMessage = 'User information not found in local storage.';
      }
  }

  getNotifications(): void {
    this.notificationService.getNotifications().subscribe(
        notifications => this.notifications = notifications,
        error => console.log(error)
    );
  }

  deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe(
        () => {
          // Remove the deleted notification from the array
          this.notifications = this.notifications.filter(notification => notification.id !== notificationId);
        },
        error => console.log(error)
    );
  }

  markNotificationAsRead(notificationId: number): void {
    this.notificationService.markNotificationAsRead(notificationId).subscribe(
        () => {
          // Update the read status of the notification
          const notification = this.notifications.find(notification => notification.id === notificationId);
          if (notification) {
            notification.read = true;
          }
        },
        error => console.log(error)
    );
  }

    private fetchUserProfile(email: string): void {
        this.usersService.getUserByEmail(email).subscribe(
            (data) => {
                this.user = data;
            },
            (error) => {
                console.error('Error fetching user data', error);
                this.errorMessage = 'Error fetching user data. Please try again later.';
            }
        );
    }

    private fetchWorkerProfile(email: string): void {
        this.workersService.getWorkerByEmail(email).subscribe(
            (data) => {
                this.user = data;
            },
            (error) => {
                console.error('Error fetching worker data', error);
                this.errorMessage = 'Error fetching worker data. Please try again later.';
            }
        );
    }

    searchNotificationBy(): void {
        if (this.searchNotification.trim() === '') {
            this.getNotifications();
        } else {
            this.notifications = this.notifications.filter(n =>
                n.createdBy.toLowerCase().includes(this.searchNotification.toLowerCase())||
                n.title.toLowerCase().includes(this.searchNotification.toLowerCase())||
                n.message.toLowerCase().includes(this.searchNotification.toLowerCase())

            );
        }
    }
}