import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuardUser implements CanActivate {

    constructor(private router: Router) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean {

        const userType = localStorage.getItem('userType');

        if (userType === 'user') {
            return true; // Allow access for users
        } else {
            this.router.navigateByUrl('/dashboard');
            return false; // Deny access for non-users

        }
    }
}