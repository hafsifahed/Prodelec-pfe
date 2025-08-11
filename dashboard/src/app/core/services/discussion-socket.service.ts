// src/app/core/services/discussion-socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Message {
  id: number;
  content: string;
  sender: { id: number; firstName: string; lastName: string; username: string };
  createdAt: string;
  discussionId: number;
}

@Injectable({ providedIn: 'root' })
export class DiscussionSocketService {
  private socket!: Socket;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    this.socket = io(environment.baseUrl, {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket']
    });

    // Réception des nouveaux messages en temps réel
    this.socket.on('newMessage', (data: { discussionId: number, message: Message }) => {
      this.addMessage(data.message);
    });
  }

  joinDiscussion(params: {
    discussionId?: number,
    cahierId?: number,
    devisId?: number,
    orderId?: number,
    projectId?: number
  }): Promise<number> {
    return new Promise(resolve => {
      this.socket.emit('joinDiscussion', params, (response: any) => {
        resolve(response.data.discussionId);
      });
    });
  }

  sendMessage(discussionId: number, content: string, senderId: number) {
    this.socket.emit('sendMessage', { discussionId, content, senderId });
  }

  private addMessage(message: Message) {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, message]);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
