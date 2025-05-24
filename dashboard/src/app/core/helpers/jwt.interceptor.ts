import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserStateService } from '../services/user-state.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService,
        private userStateService:UserStateService,
    
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        this.logoutUser();
        return EMPTY;
      }

      return this.authService.refreshToken(refreshToken).pipe(
        switchMap(response => {
          this.isRefreshing = false;
          localStorage.setItem('token', response.access_token);
          this.refreshTokenSubject.next(response.access_token);
          return next.handle(this.addToken(request, response.access_token));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.logoutUser();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => next.handle(this.addToken(request, token!)))
      );
    }
  }

  private logoutUser() {
    localStorage.clear();
    this.userStateService.setUser(null)
    // Rediriger vers login, par ex. via Router (injecter si besoin)
    window.location.href = '/signin';
  }
}
