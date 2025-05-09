import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, UrlTree } from '@angular/router';
import { Observable, of } from "rxjs";
import { WorkerSessionService } from "../services/worker-session.service";
import { UserSessionService } from "../services/user-session.service";
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    private inactivityTimer: any;
    private inactivityDuration: number = 60 * 60 * 1000;

    constructor(private router: Router,
                private workerSessionService: WorkerSessionService,
                private usersSessionService: UserSessionService) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        const userType = localStorage.getItem('userType');
        const sessionId = localStorage.getItem('sessionId');

        // Check if the session is active
        return this.checkSessionActive(userType, sessionId).pipe(
            map(isActive => {
                if (!isActive) {
                    this.router.navigate(['/signin']);
                    return false;
                }

                // Check token expiration
                if (!this.checkTokenExpiration()) {
                    return false;
                }

                // Start or reset the inactivity timer
                this.startInactivityTimer();

                return userType === 'user' || userType === 'worker';
            }),
            catchError(() => {
                this.router.navigate(['/signin']);
                return of(false);
            })
        );
    }

    checkTokenExpiration(): boolean {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1])); // Decoding the token
                const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
                if (currentTime > tokenData.exp) {
                    this.logout();
                    return false;
                }
            } catch (error) {
                console.error('Error decoding token', error);
                this.router.navigate(['/signin']);
                return false;
            }
        } else {
            console.error('Token not found.');
            this.router.navigate(['/signin']);
            return false;
        }

        return true;
    }

    logout() {
        const userType = localStorage.getItem('userType');
        const sessionId = localStorage.getItem('sessionId');

        const endSession = userType === 'worker'
            ? this.workerSessionService.endSession(Number(sessionId))
            : this.usersSessionService.endSession(Number(sessionId));

        endSession.subscribe(
            (response) => {
                console.log(`${userType} session ended`, response);
                this.clearLocalStorageAndRedirect();
            },
            (error) => {
                console.error(`Failed to end ${userType} session`, error);
                this.clearLocalStorageAndRedirect();
            }
        );
    }

    clearLocalStorageAndRedirect() {
        localStorage.clear();
        this.router.navigate(['/signin']);
    }

    startInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }

        this.inactivityTimer = setTimeout(() => {
            this.logout();
        }, this.inactivityDuration);
    }

    checkSessionActive(userType: string, sessionId: string): Observable<boolean> {
        const id = Number(sessionId);

        if (userType === 'worker') {
            return this.workerSessionService.isSessionActive(id);
        } else if (userType === 'user') {
            return this.usersSessionService.isSessionActive(id);
        } else {
            this.clearLocalStorageAndRedirect();
            return of(false);
        }
    }
}