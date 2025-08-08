import { Component, Input } from '@angular/core';
import { WorkflowDiscussion } from '../models/workflow-discussion.model';

@Component({
  selector: 'app-workflow-details-sidebar',
  templateUrl: './workflow-details-sidebar.component.html',
  styleUrls: ['./workflow-details-sidebar.component.scss']
})
export class WorkflowDetailsSidebarComponent {
  @Input() discussion: WorkflowDiscussion | null = null;
  
  // State for collapsible sections
  sections = {
    cdc: true,
    devis: true,
    orders: true,
    projects: true
  };

  // Active tab state
  activeTab: string = 'cdc';

  getOrderStatusClass(order: any): string {
    if (order.annuler) return 'badge-soft-danger';
    return 'badge-soft-success';
  }

  getProjectStatus(project: any): string {
    if (project.progress === 100) return 'Terminé';
    if (project.startConception) return 'En cours';
    return 'Non commencé';
  }

  getProjectStatusClass(project: any): string {
    if (project.progress === 100) return 'badge-soft-success';
    if (project.startConception) return 'badge-soft-primary';
    return 'badge-soft-warning';
  }

  toggleSection(section: string): void {
    this.sections[section] = !this.sections[section];
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}