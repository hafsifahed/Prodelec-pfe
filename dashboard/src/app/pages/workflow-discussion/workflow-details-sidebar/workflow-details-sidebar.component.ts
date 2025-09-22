import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WorkflowDiscussion } from '../models/workflow-discussion.model';

@Component({
  selector: 'app-workflow-details-sidebar',
  templateUrl: './workflow-details-sidebar.component.html',
  styleUrls: ['./workflow-details-sidebar.component.scss']
})
export class WorkflowDetailsSidebarComponent implements OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['discussion'] && this.discussion?.currentPhase) {
      this.setActiveTabBasedOnPhase();
    }
  }

  private setActiveTabBasedOnPhase(): void {
    if (!this.discussion) return;

    switch (this.discussion.currentPhase.toLowerCase()) {
      case 'cdc':
        if (this.discussion.cdc) this.activeTab = 'cdc';
        break;
      case 'devis':
        if (this.discussion.devis) this.activeTab = 'devis';
        break;
      case 'order':
      case 'orders':
      case 'project':
      case 'projects':
        if (this.discussion.orders && this.discussion.orders.length > 0) {
          this.activeTab = 'orders';
        }
        break;
      default:
        // Fallback logic
        if (this.discussion.devis) {
          this.activeTab = 'devis';
        } else if (this.discussion.orders && this.discussion.orders.length > 0) {
          this.activeTab = 'orders';
        } else {
          this.activeTab = 'cdc';
        }
    }
  }

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