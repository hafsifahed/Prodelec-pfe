import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { WorkflowDiscussion } from '../models/workflow-discussion.model';
import Swal from 'sweetalert2';
import { ProjectAddModalComponent } from '../../projectfo/modals/project-add-modal/project-add-modal.component';
import { AddProjectModalComponent } from '../../order/modals/add-project-modal/add-project-modal.component';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { WorkflowDiscussionService } from '../services/workflow-discussion.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';

@Component({
  selector: 'app-workflow-details-sidebar',
  templateUrl: './workflow-details-sidebar.component.html',
  styleUrls: ['./workflow-details-sidebar.component.scss']
})
export class WorkflowDetailsSidebarComponent implements OnChanges ,OnInit {
  @Input() discussion: WorkflowDiscussion | null = null;
  modalRef?: BsModalRef;
  userr: any;

  sections = { cdc: true, devis: true, orders: true, projects: true };
  activeTab: string = 'cdc';

  constructor(private modalService: BsModalService,    private router: Router,
    private projectservice: ProjectService,
    private orderService: OrderServiceService,
    private discussionService: WorkflowDiscussionService,
    private userStateService: UserStateService,
    private cdcservice: CdcServiceService,
    private devisService:DevisService
  ) {}

  ngOnInit(): void {
     this.userStateService.user$.subscribe(user => {
      this.userr = user;
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['discussion'] && this.discussion?.currentPhase) {
      this.setActiveTabBasedOnPhase();
      this.refreshDiscussion();
      console.log('discussion side details', this.discussion);
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
        if (this.discussion.orders?.length > 0) this.activeTab = 'orders';
        break;
      case 'project':
      case 'projects':
        if (this.discussion.projects?.length > 0) this.activeTab = 'projects';
        break;
      default:
        if (this.discussion.devis) this.activeTab = 'devis';
        else if (this.discussion.orders?.length > 0) this.activeTab = 'orders';
        else this.activeTab = 'cdc';
    }
  }

  toggleSection(section: string): void {
    this.sections[section] = !this.sections[section];
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getOrderStatusClass(order: any): string {
    return order.annuler ? 'badge-soft-danger' : 'badge-soft-success';
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

  duplicateProject(project: any) {
    const duplicatedProject = { ...project };
    delete duplicatedProject.idproject;
    duplicatedProject.refClient += ' - copie';

    this.modalRef = this.modalService.show(ProjectAddModalComponent, {
      initialState: { project: duplicatedProject },
      class: 'modal-xl'
    });

    this.modalRef.content.projectAdded.subscribe(() => {
      this.modalRef?.hide();
      this.refreshProjects();
    });
  }

  addProjectToOrder(order: any) {
    this.modalRef = this.modalService.show(AddProjectModalComponent, {
      initialState: { idorder: order.idOrder},
      class: 'modal-xl'
    });

    this.modalRef.content.projectAdded.subscribe(() => {
      this.modalRef?.hide();
      this.refreshProjects();
    });
  }

  archiveProject(projectId: number) {
  Swal.fire({
    title: 'Confirmer archivage',
    text: 'Cette action va archiver le projet.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Archiver',
    cancelButtonText: 'Annuler'
  }).then(result => {
    if (result.isConfirmed) {
      let isClientRole = this.userr?.role?.name?.toLowerCase().startsWith('client');

      if (isClientRole) {
        // Pour les clients
        this.projectservice.archiverc(projectId).subscribe({
          next: () => {
            Swal.fire('Archivée!', 'Le projet a été archivé côté client.', 'success');
            this.refreshProjects();
          },
          error: () => {
            Swal.fire('Erreur', 'Impossible d\'archiver le projet côté client', 'error');
          }
        });
      } else {
        // Pour les workers
        this.projectservice.archivera(projectId).subscribe({
          next: () => {
            Swal.fire('Archivée!', 'Le projet a été archivé côté worker.', 'success');
            this.refreshProjects();
          },
          error: () => {
            Swal.fire('Erreur', 'Impossible d\'archiver le projet côté worker', 'error');
          }
        });
      }
    }
  });
}



  deleteProject(projectId: number) {
  Swal.fire({
    title: 'Confirmer suppression',
    text: 'Cette action est irréversible.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Supprimer',
    cancelButtonText: 'Annuler'
  }).then(result => {
    if (result.isConfirmed) {
      this.projectservice.deleteProject(projectId).subscribe({
        next: () => {
          Swal.fire({
            title: 'Supprimé!',
            text: 'Le projet a été supprimé.',
            icon: 'success',
          });
          this.refreshProjects(); // recharge la liste projets
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de supprimer le projet.',
          });
        }
      });
    }
  });
}


  archiveOrder(orderId: number) {
  Swal.fire({
    title: 'Confirmer archivage',
    text: 'Cette action va archiver la commande.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Archiver',
    cancelButtonText: 'Annuler'
  }).then(result => {
    if (result.isConfirmed) {
      this.orderService.archivera(orderId).subscribe({
        next: () => {
          Swal.fire({
            title: 'Archivée !',
            text: 'La commande a été archivée.',
            icon: 'success',
          });
          this.refreshOrders(); // recharge la liste des commandes
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible d\'archiver la commande.',
          });
        }
      });
    }
  });
}


  deleteOrder(orderId: number) {
  Swal.fire({
    title: 'Confirmer suppression',
    text: 'Cette action est irréversible.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Supprimer',
    cancelButtonText: 'Annuler'
  }).then(result => {
    if (result.isConfirmed) {
      this.orderService.deleteOrder(orderId).subscribe({
        next: () => {
          Swal.fire({
            title: 'Supprimé !',
            text: 'La commande a été supprimée.',
            icon: 'success',
          });
          this.refreshOrders(); // recharge la liste commandes
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de supprimer la commande.',
          });
        }
      });
    }
  });
}


  viewProjectDetails(project: any): void {
  const url = this.router.serializeUrl(
    this.router.createUrlTree(['/listproject', project.idproject])
  );
  window.open(url, '_blank');
}


  refreshDiscussion() {
  if (!this.discussion) return;
  this.discussionService.getDiscussion(this.discussion.id).subscribe({
    next: (discussion) => {
      this.discussion = discussion;
      this.setActiveTabBasedOnPhase();
      console.log('Discussion rafraîchie', discussion);
      // vous avez maintenant la discussion complète rafraîchie,
      // y compris projects, orders, devis, etc.
    },
    error: (err) => {
      Swal.fire('Erreur', 'Impossible de charger les détails de la discussion.', 'error');
    }
  });
}

refreshProjects() {
  this.refreshDiscussion();
}

refreshOrders() {
  this.refreshDiscussion();
}


archiveDevis(devisId: number) {
  Swal.fire({
    title: 'Confirmer archivage',
    text: 'Cette action va archiver le devis.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Archiver',
    cancelButtonText: 'Annuler'
  }).then(result => {
    if (result.isConfirmed) {
      this.devisService.archiver(devisId).subscribe({
        next: () => {
          Swal.fire('Archivé!', 'Le devis a été archivé.', 'success');
          this.refreshDiscussion();
        },
        error: () => {
          Swal.fire('Erreur', 'Impossible d\'archiver le devis.', 'error');
        }
      });
    }
  });
}

deleteDevis(devisId: number) {
  Swal.fire({
    title: 'Confirmer suppression',
    text: 'Cette action est irréversible.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Supprimer',
    cancelButtonText: 'Annuler'
  }).then(result => {
    if (result.isConfirmed) {
      this.devisService.deleteDevis(devisId).subscribe({
        next: () => {
          Swal.fire('Supprimé!', 'Le devis a été supprimé.', 'success');
          this.refreshDiscussion();
        },
        error: () => {
          Swal.fire('Erreur', 'Impossible de supprimer le devis.', 'error');
        }
      });
    }
  });
}

archiveCdc(cdcId: number) {
  Swal.fire({
    title: 'Confirmer archivage',
    text: 'Cette action va archiver le cahier des charges.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Archiver',
    cancelButtonText: 'Annuler'
  }).then(result => {
    if (result.isConfirmed) {
      this.cdcservice.archiver(cdcId).subscribe({
        next: () => {
          Swal.fire('Archivé!', 'Le cahier des charges a été archivé.', 'success');
          this.refreshDiscussion();
        },
        error: () => {
          Swal.fire('Erreur', 'Impossible d\'archiver le cahier des charges.', 'error');
        }
      });
    }
  });
}

deleteCdc(cdcId: number) {
  Swal.fire({
    title: 'Confirmer suppression',
    text: 'Cette action est irréversible.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Supprimer',
    cancelButtonText: 'Annuler'
  }).then(result => {
    if (result.isConfirmed) {
      this.cdcservice.deleteCdc(cdcId).subscribe({
        next: () => {
          Swal.fire('Supprimé!', 'Le cahier des charges a été supprimé.', 'success');
          this.refreshDiscussion();
        },
        error: () => {
          Swal.fire('Erreur', 'Impossible de supprimer le cahier des charges.', 'error');
        }
      });
    }
  });
}

}
