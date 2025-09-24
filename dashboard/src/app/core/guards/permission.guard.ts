// permission.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserStateService } from '../services/user-state.service';
import { Action } from '../models/role.model'; // adapte le chemin

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private userState: UserStateService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.userState.getUser();
    if (!user) {
      this.router.navigate(['/signin']);
      return false;
    }

const requiredPermissions = route.data['permissions'] as { resource: string, actions: Action[] }[];
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const rolePermissions = user.role.permissions || [];

    const hasPermission = requiredPermissions.every(rp => {
  const perm = rolePermissions.find(p => p.resource === rp.resource);
  return perm && rp.actions.some((a: Action) => perm.actions.includes(a));
});


    if (!hasPermission) {
      this.router.navigate(['/dashboard']); // ou page 403
      return false;
    }

    return true;
  }
}
