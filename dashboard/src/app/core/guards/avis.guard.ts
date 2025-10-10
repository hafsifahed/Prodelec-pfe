import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AvisService } from '../services/avis.service';
import { UserStateService } from '../services/user-state.service';

@Injectable({ providedIn: 'root' })
export class AvisGuard implements CanActivate {
  
  constructor(
    private avisService: AvisService,
    private userStateService: UserStateService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const user = this.userStateService.getUser();
    
    // Vérifier que l'utilisateur est connecté et a le rôle CLIENT
    if (!user || !user.role || !user.role.name.toUpperCase().startsWith('CLIENT')) {
      return this.router.parseUrl('/dashboard');
    }

    // Vérifier si l'utilisateur a un ancien avis
    return this.avisService.hasOldAvis(user.id).pipe(
      map(hasOldAvis => {
        if (hasOldAvis) {
          return true; // Autoriser l'accès si l'utilisateur a un ancien avis
        } else {
          // Rediriger vers le dashboard si l'utilisateur n'a pas d'ancien avis
          return this.router.parseUrl('/dashboard');
        }
      }),
      catchError((error) => {
        console.error('Erreur lors de la vérification des avis', error);
        // En cas d'erreur, rediriger vers le dashboard
        return of(this.router.parseUrl('/dashboard'));
      })
    );
  }
}