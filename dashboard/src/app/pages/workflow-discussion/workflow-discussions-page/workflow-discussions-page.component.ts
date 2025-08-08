import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
  
  // Configuration de la sidebar redimensionnable
  sidebarWidth = 350; // Largeur par défaut
  isResizing = false;
  startX = 0;
  startWidth = 0;
  minWidth = 280; // Largeur minimale
  maxWidth = 500; // Largeur maximale

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
      this.loadDiscussionDetails(discussionId);
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

  // Gestion du redimensionnement
  startResizing(event: MouseEvent): void {
    this.isResizing = true;
    this.startX = event.clientX;
    this.startWidth = this.sidebarWidth;
    document.body.classList.add('resizing');
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResizing);
    event.preventDefault();
  }

  resize = (event: MouseEvent): void => {
    if (!this.isResizing) return;
    const dx = event.clientX - this.startX;
    const newWidth = this.startWidth - dx;
    
    // Applique les contraintes de largeur
    this.sidebarWidth = Math.max(this.minWidth, Math.min(this.maxWidth, newWidth));
  }

  stopResizing = (): void => {
    if (this.isResizing) {
      this.isResizing = false;
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', this.resize);
      document.removeEventListener('mouseup', this.stopResizing);
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.isResizing) {
      this.stopResizing();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkViewport());
    this.stopResizing();
  }
}