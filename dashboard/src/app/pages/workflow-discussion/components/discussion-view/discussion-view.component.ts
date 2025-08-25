import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { WorkflowSocketService } from '../../services/workflow-socket.service';
import { WorkflowDiscussion } from '../../models/workflow-discussion.model';
import { WorkflowMessage } from '../../models/workflow-message.model';
import { WorkflowDiscussionService } from '../../services/workflow-discussion.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { User } from 'src/app/core/models/auth.models';
import { UsersService } from 'src/app/core/services/user.service';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AddDevisModalComponent } from 'src/app/pages/cahierDesCharges/modals/add-devis-modal/add-devis-modal.component';
import { RefuseCdcModalComponent } from 'src/app/pages/cahierDesCharges/modals/refuse-cdc-modal/refuse-cdc-modal.component';
import { IncompleteCdcModalComponent } from 'src/app/pages/cahierDesCharges/modals/incomplete-cdc-modal/incomplete-cdc-modal.component';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import { RefuseDevisModalComponent } from 'src/app/pages/devis/modals/refuse-devis-modal/refuse-devis-modal.component';
import { DetailsDevisModalComponent } from 'src/app/pages/devis/modals/details-devis-modal/details-devis-modal.component';
import { NegociationDevisModalComponent } from 'src/app/pages/devis/modals/negociation-devis-modal/negociation-devis-modal.component';
import { ArchiveDevisModalComponent } from 'src/app/pages/devis/modals/archive-devis-modal/archive-devis-modal.component';
import Swal from 'sweetalert2';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { EtatDevis } from 'src/app/core/models/Devis/devis';
import { DetailsDevisAdminModalComponent } from 'src/app/pages/devis/modals/details-devis-admin-modal/details-devis-admin-modal.component';
import { RefuseDevisAdminModalComponent } from 'src/app/pages/devis/modals/refuse-devis-admin-modal/refuse-devis-admin-modal.component';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';

@Component({
  selector: 'app-discussion-view',
  templateUrl: './discussion-view.component.html',
  styleUrls: ['./discussion-view.component.scss']
})
export class DiscussionViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') private messagesContainer: ElementRef;

  modalRef?: BsModalRef;

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
  isLoading = true;
  isSending = false;
  error: string | null = null;
  isConnected = false;
  messageContent: string = '';

  private typingDebounce: any;
  typingUsers = new Set<number>();
  private typingTimeouts = new Map<number, any>();
  private optimisticMessages = new Map<number, WorkflowMessage>();
  private typingSubject = new Subject<void>();
  private subscriptions = new Subscription();
  private messagesSubject = new BehaviorSubject<WorkflowMessage[]>([]);
  EtatDevis = EtatDevis;
  messages$ = this.messagesSubject.asObservable();

  constructor(
    private discussionService: WorkflowDiscussionService,
    private socketService: WorkflowSocketService,
    private userStateService: UserStateService,
    public usersService: UsersService,
    private cdr: ChangeDetectorRef,
    private cdcService:CdcServiceService,
    private modalService: BsModalService,
    private devisService:DevisService,
    private orderservice:OrderServiceService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.typingSubject.pipe(debounceTime(500)).subscribe(() => {
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.socketService.disconnect();
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    if (this.typingDebounce) clearTimeout(this.typingDebounce);
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
          this.discussion = discussion;
          const processedMessages = (discussion.messages || []).map(msg => this.processMessage(msg));
          this.messagesSubject.next(processedMessages);
          this.isLoading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (err) => {
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
        this.socketService.onMessageReceived().pipe(debounceTime(100)).subscribe({
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

    let currentMessages = this.messagesSubject.getValue();
    currentMessages = [...currentMessages, tempMsg];
    this.messagesSubject.next(currentMessages);
    this.optimisticMessages.set(tempId, tempMsg);

    this.scrollToBottom();

    this.socketService.sendMessage(this.discussionId, content);

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

  onInput(): void {
    if (this.typingDebounce) clearTimeout(this.typingDebounce);
    this.typingDebounce = setTimeout(() => {
      this.typingSubject.next();
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
        } catch (err) {
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

  // ===============================
  // New action button handlers
  // ===============================

  /*onAccept(): void {
    if (!this.discussion?.cdc) return;
    this.modalRef = this.modalService.show(AddDevisModalComponent, {
      initialState: { cahier: this.discussion.cdc }
    });
    this.modalRef.content.onDevisAdded.subscribe(() => {
      this.loadDiscussion();
    });
  }*/
  onAccept(): void {
  this.cdcService.getById(this.discussion.cdc.id).subscribe({
    next: (cahier) => {
      const initialState = { cahier };
      this.modalRef = this.modalService.show(AddDevisModalComponent, { initialState });
      this.modalRef.content.onDevisAdded.subscribe(() => {
        this.loadDiscussion();
      });
    },
    error: (error) => console.error('Error fetching CDC', error)
  });
}

  onRefuse(): void {
    if (!this.discussion?.cdc) return;
    this.modalRef = this.modalService.show(RefuseCdcModalComponent, {
      initialState: { rejectId: this.discussion.cdc.id }
    });
    this.modalRef.content.onRefused.subscribe(() => {
      this.loadDiscussion();
    });
  }

  onMarkIncomplete(): void {
    if (!this.discussion?.cdc) return;
    this.modalRef = this.modalService.show(IncompleteCdcModalComponent, {
      initialState: { incompleteId: this.discussion.cdc.id }
    });
    this.modalRef.content.onMarkedIncomplete.subscribe(() => {
      this.loadDiscussion();
    });
  }

  //devis 

   accepterDevis(id: number): void {
    this.devisService.acceptdevis(this.discussion.devis.id).subscribe(
      (response) => {
        Swal.fire('Succès', 'Le devis a été accepté avec succès.', 'success');
             this.loadDiscussion();
      },
      (error) => {
        console.error('Error accepting devis', error);
        Swal.fire('Erreur', 'Une erreur est survenue lors de l\'acceptation du devis', 'error');
      }
    );
  }

  telechargerPieceJointe(fileName: string): void {
    this.devisService.downloadFile(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error downloading file', error);
        if (error.status === 404) {
          Swal.fire('Fichier introuvable', `Le fichier ${fileName} n'existe pas sur le serveur.`, 'error');
        } else {
          Swal.fire('Erreur', 'Une erreur est survenue lors du téléchargement', 'error');
        }
      }
    });
  }

  openDeleteModal(id: number): void {
  const initialState = { archiveId: id };
  this.modalRef = this.modalService.show(ArchiveDevisModalComponent, { initialState });
  this.modalRef.content.onArchived.subscribe(() => {
      this.loadDiscussion();
  });
}

  openNegociationModal(id: number): void {
  const initialState = { negociationId: id };
  this.modalRef = this.modalService.show(NegociationDevisModalComponent, { initialState });
  this.modalRef.content.onNegociationStarted.subscribe(() => {
      this.loadDiscussion();
  });
}


  openDetailsModal(id: number): void {
  this.devisService.getById(id).subscribe(
    (data) => {
      const initialState = { devis: data };
      this.modalRef = this.modalService.show(DetailsDevisModalComponent, { initialState });
      this.modalRef.content.onDownload.subscribe((fileName: string) => {
        this.telechargerPieceJointe(fileName);
      });
    },
    (error) => {
      console.error('Error fetching devis details', error);
      Swal.fire('Erreur', 'Impossible de charger les détails du devis', 'error');
    }
  );
}
openDetailsWorkerModal(id: number): void {
  this.devisService.getById(id).subscribe(
    (data) => {
      const initialState = { devis: data };
      const modalRef = this.modalService.show(DetailsDevisAdminModalComponent, { 
        initialState,
        class: 'modal-lg'
      });
      
      modalRef.content.onDevisUpdated.subscribe(() => {
            this.loadDiscussion();
      });
      
      modalRef.content.onAccept.subscribe((devisId: number) => {
        this.accepterDevis(devisId);
      });
      
      modalRef.content.onRefuse.subscribe((devisId: number) => {
        this.preparerRefus(devisId);
      });
    }
  );
}

 preparerRefus(id: number): void {
  const initialState = { refuseId: id };
  this.modalRef = this.modalService.show(RefuseDevisAdminModalComponent, { initialState });
  this.modalRef.content.onRefused.subscribe(() => {
    this.loadDiscussion();
  });
}
  openCommentModal(id: number): void {
  const initialState = { refuseId: id };
  this.modalRef = this.modalService.show(RefuseDevisModalComponent, { initialState });
  this.modalRef.content.onRefused.subscribe(() => {
      this.loadDiscussion();
  });
}

//Order
 delete(id: number) {
      Swal.fire({
        title: 'Vous êtes sûr ?',
        text: 'Vous ne pouvez pas revenir en arrière !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.orderservice.deleteOrder(id).subscribe({
            next: () => {
              Swal.fire({
                title: 'Supprimé!',
                text: 'La commande a été supprimée.',
                icon: 'success',
              });
              this.loadDiscussion();
            },
            error: () => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Il y a un problème!',
              });
            },
          });
        }
      });
    }
  
}
