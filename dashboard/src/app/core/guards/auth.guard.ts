import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/auth.models';
import { UsersService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { UserStateService } from '../services/user-state.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private inactivityTimer: any;
  private inactivityDuration = 60 * 60 * 1000; // 1 heure

  constructor(
    private router: Router,
    private usersService: UsersService,
    private authService: AuthService,
    private userStateService: UserStateService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    const token = localStorage.getItem('token');

    const requiredResource: string = route.data['resource'];
    const requiredActions: string[] = route.data['actions'] || [];

    if (!token) {
      this.router.navigate(['/signin']);
      return of(false);
    }

    if (!this.checkTokenExpiration(token)) {
      return of(false);
    }

    return this.usersService.getProfile().pipe(
      map((user: User) => {
        if (
          requiredResource &&
          requiredActions.length > 0 &&
          !this.hasAnyPermission(user, requiredResource, requiredActions)
        ) {
          this.router.navigate(['/unauthorized']);
          return false;
        }

        this.startInactivityTimer();
        return true;
      }),
      catchError(err => {
        console.error('Erreur lors de la récupération du profil ou non autorisé', err);
        this.router.navigate(['/signin']);
        return of(false);
      }),
    );
  }

  private hasAnyPermission(user: User, resource: string, actions: string[]): boolean {
    if (!user?.role?.permissions) {
      return false;
    }

    return actions.some(action =>
      user.role.permissions.some(perm =>
        perm.resource.toLowerCase() === resource.toLowerCase() &&
        perm.actions.some(a => a.toLowerCase() === action.toLowerCase()),
      ),
    );
  }

  private checkTokenExpiration(token: string): boolean {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (tokenData.exp === undefined) {
        console.warn('Le token ne contient pas de date d\'expiration');
        return true;
      }

      if (currentTime > tokenData.exp) {
        console.log('Token expiré');
        this.clearLocalStorageAndRedirect(token);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Format de token invalide', error);
      this.clearLocalStorageAndRedirect(token);
      return false;
    }
  }

  private clearLocalStorageAndRedirect(token: string): void {
    this.logout(token);
    console.log("clearLocalStorageAndRedirect appelée");
  }

  private startInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        this.clearLocalStorageAndRedirect(token);
      }
    }, this.inactivityDuration);
  }

  private logout(token: string): void {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      this.authService.logOut(tokenData.sessionId).subscribe(
        (res) => {
          console.log(res.message);
          localStorage.clear();
          this.userStateService.setUser(null);
          this.router.navigate(['/signin']);
        },
        (err) => {
          console.error('Échec du logout', err);
          localStorage.clear();
          this.userStateService.setUser(null);
          this.router.navigate(['/signin']);
        }
      );
    } catch (e) {
      console.error('Erreur lors du décodage du token pour logout', e);
      localStorage.clear();
      this.userStateService.setUser(null);
      this.router.navigate(['/signin']);
    }
  }
}
