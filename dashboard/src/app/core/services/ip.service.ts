import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IpService {
  constructor(private http: HttpClient) {}

  getIpAddress() {
    return this.http.get<{ ip: string }>('https://api.ipify.org?format=json');
  }
}
