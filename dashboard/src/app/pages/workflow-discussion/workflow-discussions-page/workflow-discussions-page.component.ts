import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowDiscussionService } from '../services/workflow-discussion.service';
import { WorkflowDiscussion } from '../models/workflow-discussion.model';

@Component({
  selector: 'app-workflow-discussions-page',
  templateUrl: './workflow-discussions-page.component.html',
  styleUrls: ['./workflow-discussions-page.component.scss']
})
export class WorkflowDiscussionsPageComponent implements OnInit, OnDestroy {
  selectedDiscussionId: number | null = null;
  isMobileView = false;
  currentDiscussion: WorkflowDiscussion | null = null;
  isLoading = false;
  error: string | null = null;
  detailsOpen = false; 

  constructor(
    private router: Router,
    private workflowService: WorkflowDiscussionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.selectedDiscussionId = idParam ? +idParam : null;
      
      if (this.selectedDiscussionId) {
        this.loadDiscussionDetails(this.selectedDiscussionId);
                  this.detailsOpen = false;
        if (this.isMobileView) {
          this.detailsOpen = false;
        }
      } else {
        this.currentDiscussion = null;
      }
    });
  }

  onDiscussionSelected(discussionId: number): void {
    if (this.isMobileView) {
      this.router.navigate(['workflow-discussions', discussionId]);
    } else {
      this.router.navigate(['workflow-discussions', { id: discussionId }]);
    }
  }

  closeDiscussionView(): void {
    this.router.navigate(['workflow-discussions']);
    this.currentDiscussion = null;
  }

  private checkViewport(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  loadDiscussionDetails(discussionId: number): void {
    this.isLoading = true;
    this.error = null;
    
    this.workflowService.getFullDiscussion(discussionId).subscribe({
      next: (discussion) => {
        this.currentDiscussion = discussion;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading discussion details', error);
        this.error = 'Impossible de charger les détails du workflow';
        this.isLoading = false;
      }
    });
  }

  toggleDetailsPanel(): void {
    this.detailsOpen = !this.detailsOpen;
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkViewport());
  }
}