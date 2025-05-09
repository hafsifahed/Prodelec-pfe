import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationrService {
  private notificationsSubject = new Subject<string>();
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() { }

  sendNotification(message: string) {
    this.notificationsSubject.next(message);
  }
}
