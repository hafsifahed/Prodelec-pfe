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
import { WebsocketService } from '../../core/services/websocket.service';
import { StompSubscription } from '@stomp/stompjs';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap } from 'rxjs';
import {NotificationService} from "../../core/services/notification.service";
import {NotificationrService} from "../../core/services/notificationr.service";
import { UsersService } from 'src/app/core/services/user.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import Swal from 'sweetalert2';
import { SearchResults, StatisticsService } from 'src/app/core/services/statistics.service';


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
  token = localStorage.getItem('token');
  unreadCount : number=0;

  keyword: string = '';
  results: SearchResults | null = null;
  loading = false;
    error: string | null = null;


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
      private webSocketService: WebsocketService,
      private notificationService :NotificationService,
      private notificationrService :NotificationrService,
      private userStateService: UserStateService,
      private statisticsService: StatisticsService, // ou autre service qui fera la recherche



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


this.userStateService.user$.subscribe(user => {
      this.user = user;
    });

      this.webSocketService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter(n => !n.read).length;
    });



  }


 onSearchChange(keyword: string) {
    this.loading = true;
    this.statisticsService.search(keyword.trim()).subscribe({
      next: (res) => {
        this.results = res;
        this.loading = false;
        this.error = null;
      },
      error: (err) => {
        this.error = 'Erreur lors de la recherche';
        this.loading = false;
      },
    });
  }


  selectSearchResult(type: string, id: number | undefined) {
  if (!id) {
    console.error('ID invalide pour la navigation:', type, id);
    return;
  }

  switch (type) {
    case 'project':
      this.router.navigate(['/listproject', id]);
      break;
    case 'devis':
      this.router.navigate(['/devis', id]);
      break;
    case 'partner':
      this.router.navigate(['/edit-partner', id]);
      break;
    default:
      console.warn('Type inconnu:', type);
  }

  
}


 markAsRead(notification: NotificationModels): void {
    if (!notification.read) {
      this.webSocketService.markAsRead(notification.id);
      notification.read = true;
      this.unreadCount = this.notifications.filter(n => !n.read).length;
    }
  }


  getTimeAgo(date: string): string {
    // Petite fonction pour afficher "il y a X minutes"
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return 'à l’instant';
    if (diff < 60) return `il y a ${diff} min`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `il y a ${h} h`;
    return d.toLocaleDateString();
  }

  getNotificationColor(title?: string): string {
  if (!title) return 'gray'; // Valeur par défaut si title est undefined ou vide
  title = title.toLowerCase();
  if (title.includes('projet')) return '#007bff';
  if (title.includes('cahier')) return '#f0cc1a';
  if (title.includes('réclamation')) return '#a11616';
  if (title.includes('devis') || title.includes('avis')) return '#28a745';
  if (title.includes('commande')) return '#17a2b8';
  return 'gray';
}


getNotificationIcon(title?: string): string {
  if (!title) return 'bx bx-question-mark';
  title = title.toLowerCase();
  if (title.includes('projet')) return 'bx bx-cart';
  if (title.includes('cahier')) return 'bx bx-file';
  if (title.includes('réclamation')) return 'bx bx-error';
  if (title.includes('avis')) return 'bx bx-comment-detail';
  if (title.includes('commande')) return 'bx bx-package';
  return 'bx bx-question-mark';
}






 
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

  logout() {
    const sessionData = this.getSessionToken(this.token);
  
    this.authService.logOut(sessionData).subscribe(
      (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Déconnexion réussie',
          text: res.message || 'Vous avez été déconnecté avec succès.',
          confirmButtonText: 'OK',
          allowOutsideClick: false
        }).then(() => {
          // Clear local storage or any auth tokens
          localStorage.clear();
          this.userStateService.setUser(null);
          this.webSocketService.clearNotifications();
          // Redirect to login or home page
          
          this.router.navigate(['/signin']);
        });
      },
      (err) => {
        console.error('Logout failed', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'La déconnexion a échoué. Veuillez réessayer.',
          confirmButtonText: 'OK'
        });
      }
    );
  }

  private getSessionToken(token: string): any {
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log(' pylod:', payload);

      return payload.sessionId ?? '';
    } catch (e) {
      console.error('Error decoding token', e);
      return '';
    }
  }
  

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

  navigateToListNotifications(): void {
    this.router.navigate(['/list-notifications']);
  }

}
