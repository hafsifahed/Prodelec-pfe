import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-workflow-discussions-page',
  templateUrl: './workflow-discussions-page.component.html',
  styleUrls: ['./workflow-discussions-page.component.scss']
})
export class WorkflowDiscussionsPageComponent implements OnInit {
  selectedDiscussionId: number | null = null;
  isMobileView = false;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.selectedDiscussionId = idParam ? +idParam : null;
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
  }

  private checkViewport(): void {
    this.isMobileView = window.innerWidth < 768;
  }
}