import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { WorkerSessionService } from "../services/worker-session.service";
import { UserSessionService } from "../services/user-session.service";
import {catchError, map} from "rxjs/operators";
import {UsersService} from "../services/users.service";

@Injectable({ providedIn: 'root' })
export class AuthGuardUserAdmin implements CanActivate {
    user: any;

    constructor(
        private router: Router,
        private workerSessionService: WorkerSessionService,
        private usersService: UsersService,
    private usersSessionService: UserSessionService
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        const userType = localStorage.getItem('userType');
        const sessionId = localStorage.getItem('sessionId');
        const userEmail = localStorage.getItem('userMail');


        // Check if the user is of type USERADMIN
        if (userType === 'user') {
            // Optionally, you can add session checks here if needed
            this.fetchUserProfile(userEmail)
            if(this.user.role=='CLIENTADMIN') {
                return this.checkSessionActive(userType, sessionId);
            }
        } else {
            this.router.navigateByUrl('/dashboard');
            return false; // Deny access for non-USERADMIN users
        }
    }

    checkSessionActive(userType: string, sessionId: string): Observable<boolean> {
        const id = Number(sessionId);

        if (userType === 'user') {
            return this.usersSessionService.isSessionActive(id).pipe(
                map(isActive => {
                    if (!isActive) {
                        localStorage.clear();
                        this.router.navigate(['/signin']);
                        return false;
                    }
                    return true;
                }),
                catchError(() => {
                    this.router.navigate(['/signin']);
                    return of(false);
                })
            );
        } else {
            localStorage.clear();
            this.router.navigate(['/signin']);
            return of(false);
        }
    }

    private fetchUserProfile(email: string): void {
        this.usersService.getUserByEmail(email).subscribe(
            (data) => {
                this.user = data;
                // this.subscribeToNotifications();
            },
            (error) => {
                console.error('Error fetching user data', error);
            }
        );
    }
}