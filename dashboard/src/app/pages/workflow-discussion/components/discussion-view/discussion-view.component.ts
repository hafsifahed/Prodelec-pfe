import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { WorkflowSocketService } from '../../services/workflow-socket.service';
import { WorkflowDiscussion } from '../../models/workflow-discussion.model';
import { WorkflowMessage } from '../../models/workflow-message.model';
import { WorkflowDiscussionService } from '../../services/workflow-discussion.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { User } from 'src/app/core/models/auth.models';
import { UsersService } from 'src/app/core/services/user.service';
import { environment } from 'src/environments/environment';
import { Subscription, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-discussion-view',
  templateUrl: './discussion-view.component.html',
  styleUrls: ['./discussion-view.component.scss']
})
export class DiscussionViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') private messagesContainer: ElementRef;

  private _discussionId: number;
  @Input() 
  set discussionId(id: number) {
    if (this._discussionId === id) return;
    
    this.cleanupDiscussion();
    this._discussionId = id;
    
    if (id) {
      this.setupWebSocket();
      this.loadDiscussion();
    }
  }
  get discussionId(): number {
    return this._discussionId;
  }

  discussion: WorkflowDiscussion;
  currentUser: User | null = null;
  token = localStorage.getItem('token');
  environment = environment;
  isLoading = true;
  isSending = false;
  error: string | null = null;
  isConnected = false;

  // Nouvelle propriété pour le contenu du message
  messageContent: string = '';
  private typingDebounce: any;

  typingUsers = new Set<number>();
  private typingTimeouts = new Map<number, any>();
  private optimisticMessages = new Map<number, WorkflowMessage>();
  private typingSubject = new Subject<void>();
  private subscriptions = new Subscription();
  private messagesSubject = new BehaviorSubject<WorkflowMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor(
    private discussionService: WorkflowDiscussionService,
    private socketService: WorkflowSocketService,
    private userStateService: UserStateService,
    public usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.typingSubject.pipe(
        debounceTime(500)
      ).subscribe(() => {
        if (this.discussionId) {
          this.socketService.sendTyping(this.discussionId);
        }
      })
    );

    this.subscriptions.add(
      this.userStateService.user$.subscribe(user => {
        this.currentUser = user;
        this.cdr.detectChanges();
      })
    );
  }

  ngAfterViewInit(): void {
    if (this.discussionId) {
      this.setupWebSocket();
    }
    this.scrollToBottom();
  }

  private cleanupDiscussion(): void {
    this.socketService.disconnect();
    this.typingUsers.clear();
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    this.discussion = null;
    this.messagesSubject.next([]);
    this.error = null;
    this.isLoading = true;
  }

  private loadDiscussion(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.detectChanges();
    
    this.subscriptions.add(
      this.discussionService.getDiscussion(this.discussionId).subscribe({
        next: (discussion) => {
            console.log('discussion detail :',discussion)
          this.discussion = discussion;
          const processedMessages = (discussion.messages || []).map(msg => this.processMessage(msg));
          this.messagesSubject.next(processedMessages);
          this.isLoading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (err) => {
          console.error('Failed to load discussion', err);
          this.error = err.message || 'Failed to load discussion';
          this.isLoading = false;
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
        })
      );

      this.subscriptions.add(
        this.socketService.onMessageReceived().pipe(
          debounceTime(100)
        ).subscribe({
          next: (message) => {
            this.handleIncomingMessage(message);
          },
          error: (err) => {
            console.error('WebSocket error:', err);
            this.cdr.detectChanges();
          }
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
          next: (error) => {
            this.error = error.message;
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error handler error:', err)
        })
      );
    } catch (error) {
      console.error('WebSocket error:', error);
      this.error = 'WebSocket connection failed';
      this.cdr.detectChanges();
    }
  }

  private handleUserTyping(userId: number): void {
    if (userId === this.currentUser?.id) return;

    this.typingUsers.add(userId);
    this.cdr.detectChanges();
        this.scrollToBottom();

    
    if (this.typingTimeouts.has(userId)) {
      clearTimeout(this.typingTimeouts.get(userId));
    }

    const timeoutId = setTimeout(() => {
      this.typingUsers.delete(userId);
      this.typingTimeouts.delete(userId);
      this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      }
    }
    
    if (!currentMessages.some(m => m.id === processedMsg.id)) {
      this.messagesSubject.next([...currentMessages, processedMsg]);
      this.cdr.detectChanges();
      this.scrollToBottom();
    }
  }

    sendMessage(content: string): void {
  if (!content) {
    this.error = 'Message cannot be empty';
    this.cdr.detectChanges();
    return;
  }

  this.error = null;
  this.isSending = true;

  const tempId = -Date.now();
  const tempMsg: WorkflowMessage = {
    id: tempId,
    content,
    author: this.currentUser,
    createdAt: new Date(),
    type: 'message'
  };

  // Ajouter message optimiste
  let currentMessages = this.messagesSubject.getValue();
  currentMessages = [...currentMessages, tempMsg];
  this.messagesSubject.next(currentMessages);
  this.optimisticMessages.set(tempId, tempMsg);

  this.scrollToBottom();

  // Envoi via socket uniquement
  this.socketService.sendMessage(this.discussionId, content);

  // Réception du message final depuis le serveur
  const sub = this.socketService.onMessageReceived().subscribe((savedMsg) => {
    if (savedMsg.author.id === this.currentUser.id && savedMsg.content === content) {
      const processedMsg = this.processMessage(savedMsg);
      const updatedMessages = this.messagesSubject.getValue().map(msg =>
        msg.id === tempId ? processedMsg : msg
      );

      this.messagesSubject.next(updatedMessages);
      this.optimisticMessages.delete(tempId);
      this.isSending = false;
      this.messageContent = '';
      this.cdr.detectChanges();
      sub.unsubscribe();
    }
  });
}


  // Nouvelle méthode pour gérer la saisie
  onInput(): void {
    // Clear existing debounce
    if (this.typingDebounce) clearTimeout(this.typingDebounce);
    
    // Emit typing event after 500ms of inactivity
    this.typingDebounce = setTimeout(() => {
      this.handleTyping();
    }, 500);
  }

  handleTyping(): void {
    this.typingSubject.next();
  }

  scrollToBottom(): void {
    this.cdr.detectChanges();
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

  getImageUrl(user: User): string {
    return this.usersService.getUserImageUrl(user);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.socketService.disconnect();
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    if (this.typingDebounce) clearTimeout(this.typingDebounce);
  }

  
}