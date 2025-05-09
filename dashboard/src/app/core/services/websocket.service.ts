import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  /*private client: Client;

  constructor() {
    this.client = new Client({
      brokerURL: `${environment.apiUrl}/ws`,
      webSocketFactory: () => new SockJS(`${environment.apiUrl}/ws`),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });
    this.client.activate();
  }

  subscribe(topic: string, handler: (message: any) => void): StompSubscription {
    return this.client.subscribe(topic, (message) => {
      handler(JSON.parse(message.body));
    });
  }

  unsubscribe(subscription: StompSubscription): void {
    subscription.unsubscribe();
  }

  send(topic: string, message: any): void {
    this.client.publish({
      destination: topic,
      body: JSON.stringify(message),
    });
  }*/
}