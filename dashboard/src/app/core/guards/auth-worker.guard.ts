import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuardWorker implements CanActivate {

    constructor(private router: Router) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {

        const userType = localStorage.getItem('userType');

        if (userType === 'worker') {
            return true; // Allow access for workers
        } else {
            this.router.navigateByUrl('/dashboard');
            return false; // Deny access for non-workers
        }
    }
}