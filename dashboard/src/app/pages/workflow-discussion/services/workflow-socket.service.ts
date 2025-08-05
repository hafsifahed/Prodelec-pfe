import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WorkflowMessage } from '../models/workflow-message.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowSocketService {
  private socket: Socket | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);

  connect(discussionId: number, token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(`${environment.baseUrl}/workflow`, {
      auth: { token },
      query: { discussionId: discussionId.toString() },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => this.connectionStatus.next(true));
    this.socket.on('disconnect', () => this.connectionStatus.next(false));
    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      this.connectionStatus.next(false);
    });
  }

  onConnectStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus.next(false);
    }
  }

  onMessageReceived(): Observable<WorkflowMessage> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('Socket not connected');
        return;
      }

      const handler = (msg: WorkflowMessage) => observer.next(msg);
      this.socket.on('message_created', handler);

      return () => this.socket?.off('message_created', handler);
    });
  }

  onTypingReceived(): Observable<{ userId: number }> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('Socket not connected');
        return;
      }

      const handler = (data: { userId: number }) => observer.next(data);
      this.socket.on('typing', handler);

      return () => this.socket?.off('typing', handler);
    });
  }

  onError(): Observable<{ message: string }> {
    return new Observable(observer => {
      if (!this.socket) return;

      const handler = (err: { message: string }) => observer.next(err);
      this.socket.on('error', handler);

      return () => this.socket?.off('error', handler);
    });
  }

  sendMessage(discussionId: number, content: string): void {
    if (this.socket?.connected) {
      this.socket.emit('new_message', { discussionId, content });
    }
  }

  sendTyping(discussionId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', { discussionId });
    }
  }
}
