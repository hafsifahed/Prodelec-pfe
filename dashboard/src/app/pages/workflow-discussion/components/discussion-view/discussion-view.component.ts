import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject, of, debounceTime } from 'rxjs';
import { WorkflowSocketService } from '../../services/workflow-socket.service';
import { MessageInputComponent } from './message-input/message-input.component';
import { WorkflowDiscussion } from '../../models/workflow-discussion.model';
import { WorkflowMessage } from '../../models/workflow-message.model';
import { WorkflowDiscussionService } from '../../services/workflow-discussion.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { User } from 'src/app/core/models/auth.models';
import { UsersService } from 'src/app/core/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-discussion-view',
  templateUrl: './discussion-view.component.html',
  styleUrls: ['./discussion-view.component.scss']
})
export class DiscussionViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MessageInputComponent) messageInput: MessageInputComponent;
  @ViewChild('messagesContainer') private messagesContainer: ElementRef;

  discussionId: number;
  discussion: WorkflowDiscussion;
  currentUser: User | null = null;
  token = localStorage.getItem('token');
  environment = environment;
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

  // Cache pour les URLs d'images déjà vérifiées
  private imageCache = new Map<number, string>();

  constructor(
    private route: ActivatedRoute,
    private discussionService: WorkflowDiscussionService,
    private socketService: WorkflowSocketService,
    private userStateService: UserStateService,
    public usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.userStateService.user$.subscribe(user => {
        this.currentUser = user;
        this.cdr.detectChanges();
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
    this.cdr.detectChanges();
    
    this.subscriptions.add(
      this.discussionService.getDiscussion(this.discussionId).subscribe({
        next: (discussion) => {
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
            console.log('Message reçu via socket:', message);
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

  handleMessageSent(content: string): void {
    if (!content?.trim()) {
      this.error = 'Message cannot be empty';
      this.cdr.detectChanges();
      return;
    }

    this.error = null;
    this.isSending = true;
    this.cdr.detectChanges();

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
    this.cdr.detectChanges();
    
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
          this.cdr.detectChanges();
        },
        error: (err) => {
          const filteredMessages = currentMessages.filter(msg => msg.id !== tempId);
          this.messagesSubject.next(filteredMessages);
          this.optimisticMessages.delete(tempId);
          this.error = err.message || "Failed to send message";
          this.isSending = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  handleTyping(): void {
    this.socketService.sendTyping(this.discussionId);
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
    if (!user || !user.id) return 'assets/images/companies/img-6.png';
    
    // Vérifier le cache d'abord
    if (this.imageCache.has(user.id)) {
      return this.imageCache.get(user.id);
    }

    // Si l'utilisateur n'a pas d'image définie
    if (!user.image) {
      const defaultUrl = 'assets/images/companies/img-6.png';
      this.imageCache.set(user.id, defaultUrl);
      return defaultUrl;
    }

    // Construire l'URL et la mettre en cache
    const imageUrl = `${environment.baseUrl}/uploads/users/ProfileImages/${user.image}`;
    this.imageCache.set(user.id, imageUrl);
    
    return imageUrl;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.socketService.disconnect();
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.imageCache.clear();
  }
}