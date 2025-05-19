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

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private inactivityTimer: any;
  private inactivityDuration = 60 * 60 * 1000; // 1 hour
  private token=localStorage.getItem('token');
  constructor(private router: Router, 
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {

    // Extract required resource and actions from route data
    const requiredResource: string = route.data['resource'];
    const requiredActions: string[] = route.data['actions'] || [];

    if (!this.token) {
        console.log("aaaa");
      this.router.navigate(['/signin']);
      return of(false);
    }

    if (!this.checkTokenExpiration(this.token)) {
      return of(false);
    }

    // Fetch current user profile from backend
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
        console.error('Failed to get user profile or unauthorized', err);
       this.router.navigate(['/signin']);
        return of(false);
      }),
    );
  }

  private hasAnyPermission(user: User, resource: string, actions: string[]): boolean {
    if (!user?.role?.permissions) {
      return false;
    }

    // Check if user has at least one of the required actions on the resource
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
  
      // If 'exp' is missing, log a warning but don't clear storage
      if (tokenData.exp === undefined) {
        console.warn('Token has no expiration time');
        return true; // Assume token is valid if 'exp' is missing
      }
  
      if (currentTime > tokenData.exp) {
        console.log('Token expired');
        this.clearLocalStorageAndRedirect();
        return false;
      }
  
      return true;
    } catch (error) {
      console.error('Invalid token format', error);
      this.clearLocalStorageAndRedirect();
      return false;
    }
  }
  

  private clearLocalStorageAndRedirect(): void {
    this.logout(this.token);
    localStorage.clear();
    this.router.navigate(['/signin']);
    console.log("clearLocalStorageAndRedirect ");

  }

  private startInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = setTimeout(() => {
      this.clearLocalStorageAndRedirect();
    }, this.inactivityDuration);
  }

  logout(token: string) {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    
    this.authService.logOut(tokenData.sessionId).subscribe(
    (res) => {
    console.log(res.message);
    localStorage.clear();
  },
    (err) => {
    console.error('Logout failed', err);
    }
    );
    } 
}
