import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserStateService } from '../services/user-state.service';

@Injectable({ providedIn: 'root' })
export class ClientAdminGuard implements CanActivate {
  
  constructor(
    private userStateService: UserStateService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const user = this.userStateService.getUser();
    
    // Vérifier que l'utilisateur est connecté et a le rôle CLIENT_ADMIN
    if (!user || !user.role || !user.role.name.toUpperCase().includes('CLIENTADMIN')) {
      return this.router.parseUrl('/dashboard');
    }

    return true;
  }
}