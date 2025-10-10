import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { Action, Resource } from 'src/app/core/models/role.model';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cdc-list-archive',
  templateUrl: './cdc-list-archive.component.html',
  styleUrls: ['./cdc-list-archive.component.scss']
})
export class CDCListArchiveComponent implements OnInit {
  cahierDesCharges: CahierDesCharges[] = [];
  cahier: CahierDesCharges;
  modalRef?: BsModalRef;
  searchEmail: string = '';
  deleteId: number | null = null;
  restoreId: number | null = null;
  itemsPerPage: number = 5; // Items per page
  selectedYear: string = 'All'; // Default to 'All' to show all years
  isAscending: boolean = true;
        Resource = Resource;
    Action = Action;
  p: number = 1; // Current page number

  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;
  @ViewChild('restoreModal', { static: false }) restoreModal?: ModalDirective;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;

  constructor(private cdcService: CdcServiceService, 
        public userState: UserStateService,
    private modalService: BsModalService) {}

  ngOnInit(): void {
    this.loadArchivedCahiers();  // Appel explicite de la méthode de chargement
  }

  loadArchivedCahiers(): void {
    this.cdcService.getArchiveByUserRole().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          console.log('Pas de cahiers des charges archivés',data);
          Swal.fire('Oops...', 'Pas de cahiers des charges archivés.', 'warning');
          this.cahierDesCharges = [];
        } else {
          this.cahierDesCharges = data;
          console.log(this.cahierDesCharges);
        }
      },
      error: (error) => {
        console.error('Erreur chargement archives', error);
        Swal.fire('Oops...', 'Erreur lors du chargement des cahiers archivés!', 'error');
      }
    });
  }

  getArchivedCahiers(): CahierDesCharges[] {
    return this.cahierDesCharges.filter(cdc =>
      (!this.searchEmail || (cdc.user?.email && cdc.user.email.toLowerCase().includes(this.searchEmail.toLowerCase())))
    );
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.cahierDesCharges.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  openDetailsModal(id: number): void {
    this.cdcService.getById(id).subscribe({
      next: (data) => {
        this.cahier = data;
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
      },
      error: () => Swal.fire('Erreur', 'Erreur lors du chargement des détails', 'error'),
    });
  }

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.deleteId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  openRestoreModal(id: number, template: TemplateRef<any>): void {
    this.restoreId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmRestore(): void {
    if (!this.restoreId) return;
    this.cdcService.restorer(this.restoreId).subscribe({
      next: () => {
        Swal.fire('Restauré!', 'Le cahier des charges a été restauré avec succès.', 'success');
        this.loadArchivedCahiers();
        this.modalRef?.hide();
      },
      error: () => Swal.fire('Erreur', "Le cahier n'a pas pu être restauré", 'error'),
    });
  }

  confirmDelete(): void {
    if (!this.deleteId) return;
    this.cdcService.deleteCdc(this.deleteId).subscribe({
      next: () => {
        Swal.fire('Supprimé!', 'Le cahier des charges a été supprimé avec succès.', 'success');
        this.cahierDesCharges = this.cahierDesCharges.filter(cdc => cdc.id !== this.deleteId);
        this.deleteId = null;
        this.loadArchivedCahiers();
        this.modalRef?.hide();
      },
      error: () => Swal.fire('Erreur', "Le cahier n'a pas pu être supprimé", 'error'),
    });
  }
}
