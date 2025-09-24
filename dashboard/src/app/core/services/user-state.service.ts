import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/auth.models';
import { Action, Resource } from '../models/role.model';

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  setUser(user: User) {
    this.userSubject.next(user);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  getRoleName(): string | null {
    return this.getUser()?.role?.name ?? null;
  }

  isClient(): boolean {
    return this.getRoleName()?.startsWith('CLIENT') ?? false;
  }

  isWorker(): boolean {
    return !this.isClient();
  }

  hasAnyPermission(resource: Resource, actions: Action[]): boolean {
  const user = this.getUser();
  if (!user) return false;
  return user.role?.permissions?.some(
    p => p.resource === resource && actions.some(a => p.actions.includes(a))
  ) ?? false;
}

}
