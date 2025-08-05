import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
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
  error: string | null = null;
  @Input() selectedDiscussionId: number | null = null;
@Output() discussionSelected = new EventEmitter<number>();
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
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
        }
      })
    );
  }

  loadDiscussions(): void {
  this.isLoading = true;
  this.error = null;
  
  this.subscriptions.add(
    this.discussionService.getDiscussionsByUser(
      this.currentPage, 
      this.itemsPerPage
    ).subscribe({
      next: (response) => {
        console.log("disc from",response.discussions)
                console.log("disc from total",response.total)

        this.discussions = response.discussions;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load discussions', err);
        this.error = 'Failed to load discussions';
        this.isLoading = false;
      }
    })
  );
}

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDiscussions();
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
}