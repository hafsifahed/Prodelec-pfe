import { Component, OnInit, Output, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { WorkersService } from '../../core/services/workers.service';
import { WorkerSessionService } from '../../core/services/worker-session.service';
import { UserSessionService } from '../../core/services/user-session.service';
import { NotificationModels } from '../../core/models/notification.models';
import { WebSocketService } from '../../core/services/websocket.service';
import { StompSubscription } from '@stomp/stompjs';
import { Subscription } from 'rxjs';
import {NotificationService} from "../../core/services/notification.service";
import {NotificationrService} from "../../core/services/notificationr.service";
import { UsersService } from 'src/app/core/services/user.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  private stompSubscription: StompSubscription;
  notifications: NotificationModels[] = [];
  element: any;
  cookieValue: any;
  flagvalue: any;
  countryName: any;
  valueset: any;
  user: any;
  userType: string | null = '';
  errorMessage = '';
  notification: { message: string; type: string; time: string }[] = [];
  sessionId = localStorage.getItem('sessionId');
  token = localStorage.getItem('token');
  unreadCount: number;


  constructor(
      @Inject(DOCUMENT) private document: any,
      private router: Router,
      private authService: AuthService,
      private authFackservice: AuthfakeauthenticationService,
      public languageService: LanguageService,
      public translate: TranslateService,
      private usersService: UsersService,
      private workersService: WorkersService,
      private workerSessionService: WorkerSessionService,
      private usersSessionService: UserSessionService,
      public _cookiesService: CookieService,
      private webSocketService: WebSocketService,
      private notificationService :NotificationService,
      private notificationrService :NotificationrService,
      private userStateService: UserStateService


  ) { }

  listLang: any = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  openMobileMenu: boolean;

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  ngOnInit() {
    this.openMobileMenu = false;
    this.element = document.documentElement;


    this.cookieValue = this._cookiesService.get('lang');
    const val = this.listLang.filter(x => x.lang === this.cookieValue);
    this.countryName = val.map(element => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) { this.valueset = 'assets/images/flags/us.jpg'; }
    } else {
      this.flagvalue = val.map(element => element.flag);
    }

  /*  const userType = localStorage.getItem('userType');
    const sessionId = localStorage.getItem('sessionId');
    this.checkSessionActive(userType,sessionId);
this.getUserTypeAndFetchProfile();*/

//this.loadUserProfile();
this.usersService.getProfile().subscribe({
  next: (user) => {
    this.user = user;
    this.userStateService.setUser(user);
  },
  error: (err) => {
    console.error('Failed to load user profile', err);
  },
});


  }

  /*private loadUserProfile(): void {
    this.usersService.getnameProfile().subscribe({
      next: (userData) => {
        this.user = userData;
      },
      error: (error) => {
        console.error('Error fetching user profile', error);
        this.errorMessage = 'Failed to load user profile. Please try again later.';
      },
    });
  }*/

  /*getUserTypeAndFetchProfile(): void {
    this.userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userMail');

    if (this.userType && userEmail) {
      this.checkTokenExpiration();

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
  }*/
 /* ngOnDestroy(): void {
    if (this.stompSubscription) {
      this.webSocketService.unsubscribe(this.stompSubscription);
    }
  }*/

 /* private subscribeToNotifications() {
    if (this.userType === 'user' && this.user) {
      this.stompSubscription = this.webSocketService.subscribe(`/topic/notifications/user/${this.user.id}`, (notification: NotificationModels) => {
        this.notifications.push(notification);
      });
    } else if (this.userType === 'worker' && this.user) {
      this.stompSubscription = this.webSocketService.subscribe(`/topic/notifications/worker/${this.user.id}`, (notification: NotificationModels) => {
        this.notifications.push(notification);
      });
    } else {
      this.stompSubscription = this.webSocketService.subscribe('/topic/notifications', (notification: NotificationModels) => {
        this.notifications.push(notification);
      });
    }
  }*/

 /* private fetchUserProfile(email: string): void {
    this.usersService.getUserByEmail(email).subscribe(
        (data) => {
          this.user = data;
          this.loadUserNotifications(this.user.id)
         // this.subscribeToNotifications();
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
          this.loadNotifications(this.user)

        },
        (error) => {
          console.error('Error fetching worker data', error);
          this.errorMessage = 'Error fetching worker data. Please try again later.';
        }
    );
  }
*/
  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }
/*
  logout() {
    const userType = localStorage.getItem('userType');

    if (userType === 'worker') {
      this.workerSessionService.endSession(Number(this.sessionId)).subscribe(
          (response) => {
            console.log('Worker session ended', response);
            localStorage.clear();
            this.router.navigate(['/signin']);
          },
          (error) => {
            console.error('Failed to end worker session', error);
            this.router.navigate(['/signin']);
          }
      );
    } else if (userType === 'user') {
      this.usersSessionService.endSession(Number(this.sessionId)).subscribe(
          (response) => {
            console.log('User session ended', response);
            localStorage.clear();
            this.router.navigate(['/signin']);
          },
          (error) => {
            console.error('Failed to end user session', error);
            this.router.navigate(['/signin']);
          }
      );
    } else {
      localStorage.clear();
      this.router.navigate(['/signin']);
    }
  }
*/
  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
    if (
        !document.fullscreenElement && !this.element.mozFullScreenElement &&
        !this.element.webkitFullscreenElement) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        this.document.msExitFullscreen();
      }
    }
  }
/*
  loadNotifications(u: any): void {
    if (u.role === 'ADMIN' || u.role==='SUBADMIN' ) {
      this.notificationService.getNotifications().subscribe(
          (notifications) => {
            // Get the current date and the date from three months ago
            const now = new Date();
            const threeMonthsAgo = new Date(now);
            threeMonthsAgo.setMonth(now.getMonth() - 3);

            // Filter notifications from the last 3 months
            const recentNotifications = notifications.filter(notification => {
              const notificationDate = new Date(notification.createdAt);
              return notificationDate >= threeMonthsAgo;
            });

            // Sort notifications to have unread ones on top
            this.notifications = recentNotifications.sort((a, b) => {
              // First, sort by read status
              if (a.read === b.read) {
                // If both have the same read status, sort by createdAt date
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
              }
              return a.read ? 1 : -1; // Unread notifications come first
            });

            // Optionally, you can reverse the order if you want the latest notifications first
            // this.notifications.reverse();

            this.updateUnreadCount();
          },
          (error) => {
            console.log("Error loading notifications:", error);
          }
      );
    } else {
      this.loadWorkerNotifications(u.id);
    }
  }
  loadWorkerNotifications(id: any): void {
    this.notificationService.getNotificationsByWorkerId(id).subscribe(
        (notifications) => {
          // Get the current date and the date from three months ago
          const now = new Date();
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);

          // Filter notifications from the last 3 months
          const recentNotifications = notifications.filter(notification => {
            const notificationDate = new Date(notification.createdAt); // Assurez-vous que createdAt est un format de date valide
            return notificationDate >= threeMonthsAgo;
          });

          // Sort notifications to have unread ones on top
          this.notifications = recentNotifications.sort((a, b) => {
            // First, sort by read status
            if (a.read === b.read) {
              // If both have the same read status, sort by createdAt date
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
            }
            return a.read ? 1 : -1; // Unread notifications come first
          });

          // Optionally, you can reverse the order if you want the latest notifications first
          // this.notifications.reverse();

          this.updateUnreadCount();
        },
        (error) => {
          console.log("Error loading worker notifications:", error);
        }
    );
  }
  loadUserNotifications(id: any): void {
    this.notificationService.getNotificationsByUserId(id).subscribe(
        (notifications) => {
          // Get the current date and the date from three months ago
          const now = new Date();
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);

          // Filter notifications from the last 3 months
          const recentNotifications = notifications.filter(notification => {
            const notificationDate = new Date(notification.createdAt); // Assurez-vous que createdAt est un format de date valide
            return notificationDate >= threeMonthsAgo;
          });

          // Sort notifications to have unread ones on top
          this.notifications = recentNotifications.sort((a, b) => {
            // First, sort by read status
            if (a.read === b.read) {
              // If both have the same read status, sort by createdAt date
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
            }
            return a.read ? 1 : -1; // Unread notifications come first
          });

          // Optionally, you can reverse the order if you want the latest notifications first
          // this.notifications.reverse();

          this.updateUnreadCount();
        },
        (error) => {
          console.log("Error loading user notifications:", error);
        }
    );
  }
*/

/*
  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(notification => !notification.read).length;
  }

  markAsRead(notification: NotificationModels): void {
    this.notificationService
        .markNotificationAsRead(notification.id)
        .subscribe((updatedNotification) => {
          notification.read = updatedNotification.read;
        });
    this.loadNotifications(this.user);
  }

  getTimeAgo(timestamp: string): string {
    const currentTime = new Date().getTime();
    const notificationTime = new Date(timestamp).getTime();
    const timeDifference = currentTime - notificationTime;

    // Calculate the time in various units
    const minutes = Math.floor(timeDifference / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (weeks > 0) {
      return weeks === 1 ? "1w" : `${weeks}w`;
    } else if (days > 0) {
      return days === 1 ? "1d" : `${days}d`;
    } else if (hours > 0) {
      return hours === 1 ? "1h" : `${hours}h`;
    } else {
      return minutes <= 1 ? "just now" : `${minutes}m`;
    }
  }

  // Assuming you have a method like this in your component

  checkTokenExpiration() {
    const token = localStorage.getItem('token');

    if (token) {
      const tokenData = JSON.parse(atob(token.split('.')[1])); // Decoding the token
      // Check if the token has an expiry time
      if (tokenData && tokenData.exp) {
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

        // Compare the current time with the expiry time
        if (currentTime > tokenData.exp) {
          // Token has expired, initiate logout
          this.logout();
        }
      } else {
        console.error('Token does not contain an expiry time.');
      }
    } else {
      console.error('Token not found.');

    }
  }
  checkSessionActive(userType: string, sessionId: string): void {
    const id = Number(sessionId);

    if (userType === 'worker') {
      this.workerSessionService.isSessionActive(id).subscribe((isActive: boolean) => {
        if(isActive==false){
          localStorage.clear();
          this.router.navigateByUrl('/signin');
        }
      });
    } else if (userType === 'user') {
      this.usersSessionService.isSessionActive(id).subscribe((isActive: boolean) => {
        if(isActive==false){
          localStorage.clear();
          this.router.navigateByUrl('/signin');
        }
      });
    } else {
      localStorage.clear();
      this.router.navigateByUrl('/signin');
    }
  }*/
}
