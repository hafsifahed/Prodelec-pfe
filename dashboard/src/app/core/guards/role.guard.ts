// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserStateService } from '../services/user-state.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private userState: UserStateService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.userState.getUser();
    if (!user) {
      this.router.navigate(['/signin']);
      return false;
    }

    const allowedRoles = route.data['allowedRoles'] as ('CLIENT' | 'WORKER')[];
    if (!allowedRoles) return true;

    if (allowedRoles.includes('CLIENT') && this.userState.isClient()) return true;
    if (allowedRoles.includes('WORKER') && this.userState.isWorker()) return true;

    this.router.navigate(['/forbidden']); // ou dashboard
    return false;
  }
}
