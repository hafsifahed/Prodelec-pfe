import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Subscription, interval, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { WorkflowDiscussionSidebar } from '../models/workflow-discussion-sidebar.model';
import { User } from 'src/app/core/models/auth.models';
import { WorkflowDiscussionService } from '../services/workflow-discussion.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-discussion-list',
  templateUrl: './discussion-list.component.html',
  styleUrls: ['./discussion-list.component.scss']
})
export class DiscussionListComponent implements OnInit, OnDestroy {
  discussions: WorkflowDiscussionSidebar[] = [];
  currentUser: User | null = null;
  isLoading = true;
  isLoadingMore = false;
  error: string | null = null;
  @Input() selectedDiscussionId: number | null = null;
  @Output() discussionSelected = new EventEmitter<number>();

  // Pagination infinie
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;
  hasMore = true;

  // Recherche
  searchTerm = '';
  private searchSubject = new Subject<string>();

  private subscriptions = new Subscription();

  constructor(
    private discussionService: WorkflowDiscussionService,
    private userStateService: UserStateService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.userStateService.user$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadDiscussions();

          // Auto-refresh every 10 seconds
          this.subscriptions.add(
            interval(10000).subscribe(() => {
              this.refreshDiscussions();
            })
          );
        }
      })
    );

    // Configuration de la recherche avec debounce
    this.subscriptions.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.onSearch(searchTerm);
      })
    );
  }

  // Gestion de la recherche
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  onSearch(searchTerm: string): void {
    this.currentPage = 1;
    this.hasMore = true;
    this.loadDiscussions();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.hasMore = true;
    this.loadDiscussions();
  }

  // Charger les discussions initiales
  loadDiscussions(): void {
    this.isLoading = true;
    this.error = null;
    this.currentPage = 1;

    this.subscriptions.add(
      this.discussionService.getDiscussionsByUser(
        this.currentPage,
        this.itemsPerPage,
        this.searchTerm
      ).subscribe({
        next: (response) => {
          this.discussions = response.discussions;
          this.totalItems = response.total;
          this.isLoading = false;
          this.hasMore = (this.currentPage * this.itemsPerPage) < this.totalItems;
        },
        error: (err) => {
          console.error('Failed to load discussions', err);
          this.error = 'Failed to load discussions';
          this.isLoading = false;
        }
      })
    );
  }

  // Rafraîchir les discussions (pour l'auto-refresh)
  refreshDiscussions(): void {
    this.subscriptions.add(
      this.discussionService.getDiscussionsByUser(
        1,
        this.currentPage * this.itemsPerPage,
        this.searchTerm
      ).subscribe({
        next: (response) => {
          this.discussions = response.discussions;
          this.totalItems = response.total;
          this.hasMore = (this.currentPage * this.itemsPerPage) < this.totalItems;
        },
        error: (err) => {
          console.error('Failed to refresh discussions', err);
        }
      })
    );
  }

  // Charger plus de discussions
  loadMoreDiscussions(): void {
    if (this.isLoadingMore || !this.hasMore) return;

    this.isLoadingMore = true;
    const nextPage = this.currentPage + 1;

    this.subscriptions.add(
      this.discussionService.getDiscussionsByUser(
        nextPage,
        this.itemsPerPage,
        this.searchTerm
      ).subscribe({
        next: (response) => {
          this.discussions = [...this.discussions, ...response.discussions];
          this.totalItems = response.total;
          this.currentPage = nextPage;
          this.isLoadingMore = false;
          this.hasMore = (this.currentPage * this.itemsPerPage) < this.totalItems;
        },
        error: (err) => {
          console.error('Failed to load more discussions', err);
          this.isLoadingMore = false;
        }
      })
    );
  }

  // Écouter le scroll de la fenêtre
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    // Charger plus quand on est à 200px du bas
    if (bodyHeight - scrollPosition - windowSize < 200) {
      this.loadMoreDiscussions();
    }
  }

  // Ou utiliser cette méthode si vous préférez le scroll sur un conteneur spécifique
  onScroll(event: any): void {
    const element = event.target;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
    
    if (atBottom) {
      this.loadMoreDiscussions();
    }
  }

  getDiscussionTitle(discussion: WorkflowDiscussionSidebar): string {
    if (!discussion.cdc) return 'Untitled Discussion';

    switch (discussion.currentPhase) {
      case 'cdc':
        return discussion.cdc.titre;
      case 'devis':
        return `${discussion.cdc.titre} - ${discussion.devis?.numdevis || 'Devis'}`;
      case 'order':
        return `${discussion.cdc.titre} - ${discussion.orders?.[0]?.orderName || 'Order'}`;
      case 'project':
        return `${discussion.cdc.titre} - ${discussion.projects?.[0]?.refClient || 'Project'}`;
      default:
        return discussion.cdc.titre;
    }
  }

  getLastMessagePreview(discussion: WorkflowDiscussionSidebar): string {
    if (!discussion.lastMessage) return 'No messages yet';

    const content = discussion.lastMessage.content;
    return content.length > 50 
      ? `${content.substring(0, 50)}...` 
      : content;
  }

  getMessageAuthorName(message: { author: User }): string {
    if (!message?.author) return 'Unknown';
    return `${message.author.firstName} ${message.author.lastName}`;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  isCurrentUserAuthorOfLastMessage(discussion: WorkflowDiscussionSidebar): boolean {
    if (!discussion.lastMessage || !this.currentUser) return false;
    return discussion.lastMessage.author.id === this.currentUser.id;
  }

  isLastMessageUnread(discussion: WorkflowDiscussionSidebar): boolean {
    if (!discussion.lastMessage || !discussion.lastMessage.author || !this.currentUser?.id) return false;
    return !discussion.lastMessage.read && discussion.lastMessage.author.id !== this.currentUser.id;
  }

  getLastMessageClass(discussion: WorkflowDiscussionSidebar): string {
    if (!discussion.lastMessage) return 'item-preview';

    const baseClass = 'item-preview';

    if (this.isLastMessageUnread(discussion)) {
      return `${baseClass} unread`;
    } else if (this.isCurrentUserAuthorOfLastMessage(discussion)) {
      return `${baseClass} own-message`;
    }

    return baseClass;
  }
}