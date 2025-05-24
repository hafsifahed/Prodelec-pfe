import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from './core/services/user.service';
import { UserStateService } from './core/services/user-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(
    private usersService: UsersService,
    private userStateService: UserStateService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token && !this.isTokenExpired(token)) {
      this.subscription = this.usersService.getProfile().subscribe({
        next: (user) => this.userStateService.setUser(user),
        error: () => this.userStateService.setUser(null),
      });
    } else {
      this.userStateService.setUser(null);
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) {
        console.warn('Token sans date d\'expiration');
        return false;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime > payload.exp;
    } catch (e) {
      console.error('Erreur lors du décodage du token', e);
      return true;
    }
  }
}
