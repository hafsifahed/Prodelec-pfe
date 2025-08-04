// discussion-view.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { WorkflowSocketService } from '../../services/workflow-socket.service';
import { MessageInputComponent } from './message-input/message-input.component';
import { WorkflowDiscussion } from '../../models/workflow-discussion.model';
import { WorkflowMessage } from '../../models/workflow-message.model';
import { WorkflowDiscussionService } from '../../services/workflow-discussion.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { User } from 'src/app/core/models/auth.models';
import { UsersService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-discussion-view',
  templateUrl: './discussion-view.component.html',
  styleUrls: ['./discussion-view.component.scss'],
})
export class DiscussionViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MessageInputComponent) messageInput: MessageInputComponent;
  @ViewChild('messagesContainer') private messagesContainer: ElementRef;

  discussionId: number;
  discussion: WorkflowDiscussion;
  currentUser: User | null = null;
  token = localStorage.getItem('token');

  isLoading = true;
  isSending = false;
  error: string | null = null;
  isConnected = false;

  typingUsers = new Set<number>();
  private typingTimeouts = new Map<number, any>();
  private optimisticMessages = new Map<number, WorkflowMessage>();

  private subscriptions = new Subscription();
  private messagesSubject = new BehaviorSubject<WorkflowMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor(
    private route: ActivatedRoute,
    private discussionService: WorkflowDiscussionService,
    private socketService: WorkflowSocketService,
    private userStateService: UserStateService,
    public usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.userStateService.user$.subscribe(user => {
        this.currentUser = user;
      })
    );
    
    this.discussionId = +this.route.snapshot.paramMap.get('id');
    this.loadDiscussion();
  }

  ngAfterViewInit(): void {
    this.setupWebSocket();
    this.scrollToBottom();
  }

  private loadDiscussion(): void {
  this.isLoading = true;
  this.error = null;
  
  this.subscriptions.add(
    this.discussionService.getDiscussion(this.discussionId).subscribe({
      next: (discussion) => {
        console.log('idd',discussion)
        this.discussion = discussion;
        const processedMessages = (discussion.messages || []).map(msg => this.processMessage(msg));
        this.messagesSubject.next(processedMessages);
        this.isLoading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Failed to load discussion', err);
        this.error = err.message || 'Failed to load discussion';
        this.isLoading = false;
      }
    })
  );
}

  private processMessage(msg: WorkflowMessage): WorkflowMessage {
    return {
      ...msg,
      createdAt: typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt,
      author: this.enrichAuthorData(msg.author)
    };
  }

  private enrichAuthorData(author: any): any {
    if (!author) return null;
    if (author.firstName && author.lastName) return author;
    
    const participants = [
      this.discussion?.cdc?.user,
      this.discussion?.devis?.user,
      ...(this.discussion?.orders?.map(o => o.user) || []),
      ...(this.discussion?.projects?.map(p => p.user) || [])
    ].filter(u => u && u.id);
    
    return participants.find(u => u.id === author.id) || author;
  }

  private setupWebSocket(): void {
    try {
      this.socketService.connect(this.discussionId, this.token);

      this.subscriptions.add(
        this.socketService.onConnectStatus().subscribe(isConnected => {
          this.isConnected = isConnected;
        })
      );

      this.subscriptions.add(
        this.socketService.onMessageReceived().subscribe({
          next: (message) => this.handleIncomingMessage(message),
          error: (err) => console.error('WebSocket error:', err)
        })
      );

      this.subscriptions.add(
        this.socketService.onTypingReceived().subscribe({
          next: ({ userId }) => this.handleUserTyping(userId),
          error: (err) => console.error('Typing error:', err)
        })
      );

      this.subscriptions.add(
        this.socketService.onError().subscribe({
          next: (error) => this.error = error.message,
          error: (err) => console.error('Error handler error:', err)
        })
      );
    } catch (error) {
      console.error('WebSocket error:', error);
      this.error = 'WebSocket connection failed';
    }
  }

  private handleUserTyping(userId: number): void {
    if (userId === this.currentUser?.id) return;

    this.typingUsers.add(userId);
    
    if (this.typingTimeouts.has(userId)) {
      clearTimeout(this.typingTimeouts.get(userId));
    }

    const timeoutId = setTimeout(() => {
      this.typingUsers.delete(userId);
      this.typingTimeouts.delete(userId);
    }, 3000);

    this.typingTimeouts.set(userId, timeoutId);
  }

  private handleIncomingMessage(message: WorkflowMessage): void {
    const processedMsg = this.processMessage(message);
    const currentMessages = this.messagesSubject.getValue();
    
    if (this.optimisticMessages.has(message.id)) {
      const optimisticId = this.optimisticMessages.get(message.id)?.id;
      if (optimisticId) {
        const filteredMessages = currentMessages.filter(m => m.id !== optimisticId);
        this.messagesSubject.next(filteredMessages);
        this.optimisticMessages.delete(message.id);
      }
    }
    
    if (!currentMessages.some(m => m.id === processedMsg.id)) {
      this.messagesSubject.next([...currentMessages, processedMsg]);
      this.scrollToBottom();
    }
  }

  handleMessageSent(content: string): void {
    if (!content?.trim()) {
      this.error = 'Message cannot be empty';
      return;
    }

    this.error = null;
    this.isSending = true;

    const tempId = -Date.now();
    const tempMsg: WorkflowMessage = {
      id: tempId,
      content: content.trim(),
      author: this.currentUser,
      createdAt: new Date(),
      type: 'message'
    };

    this.optimisticMessages.set(tempId, tempMsg);
    const currentMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...currentMessages, tempMsg]);
    this.scrollToBottom();

    this.socketService.sendMessage(this.discussionId, content);

    this.subscriptions.add(
      this.discussionService.addMessage(this.discussionId, content).subscribe({
        next: (savedMsg) => {
          const processedMsg = this.processMessage(savedMsg);
          const updatedMessages = currentMessages.map(msg => 
            msg.id === tempId ? processedMsg : msg
          );
          this.messagesSubject.next(updatedMessages);
          this.optimisticMessages.delete(tempId);
          this.isSending = false;
        },
        error: (err) => {
          const filteredMessages = currentMessages.filter(msg => msg.id !== tempId);
          this.messagesSubject.next(filteredMessages);
          this.optimisticMessages.delete(tempId);
          this.error = err.message || "Failed to send message";
          this.isSending = false;
        }
      })
    );
  }

  handleTyping(): void {
    this.socketService.sendTyping(this.discussionId);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        try {
          this.messagesContainer.nativeElement.scrollTop = 
            this.messagesContainer.nativeElement.scrollHeight;
        } catch(err) {
          console.error('Scroll error:', err);
        }
      }
    }, 100);
  }

  trackByMessageId(index: number, message: WorkflowMessage): number {
    return message.id;
  }

  getParticipantName(userId: number): string {
    if (userId === this.currentUser?.id) return 'You';
    
    const participants = [
      this.discussion?.cdc?.user,
      this.discussion?.devis?.user,
      ...(this.discussion?.orders?.map(o => o.user) || []),
      ...(this.discussion?.projects?.map(p => p.user) || [])
    ].filter(u => u);
    
    const user = participants.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown user';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.socketService.disconnect();
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
  }
}