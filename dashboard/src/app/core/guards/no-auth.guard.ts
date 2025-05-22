import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserStateService } from '../services/user-state.service';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private userStateService: UserStateService, private router: Router) {}

  canActivate(): boolean {
  const user = this.userStateService.getUser();
  console.log('NoAuthGuard canActivate, user:', user);
  if (user) {
    this.router.navigate(['/profile']);
    return false;
  }
  return true;
}

}
