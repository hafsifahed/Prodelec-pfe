import { Component, Input } from '@angular/core';
import { WorkflowDiscussion } from '../models/workflow-discussion.model';

@Component({
  selector: 'app-workflow-details-sidebar',
  templateUrl: './workflow-details-sidebar.component.html',
  styleUrls: ['./workflow-details-sidebar.component.scss']
})
export class WorkflowDetailsSidebarComponent {
  @Input() discussion: WorkflowDiscussion | null = null;
}