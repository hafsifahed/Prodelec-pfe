import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
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
  constructor(private cdcService: CdcServiceService, private modalService: BsModalService) {}

  ngOnInit(): void {
    this.cdcService.getAllCdc().subscribe(
      data => this.cahierDesCharges = data,
      error => console.error('Erreur lors de la récupération des données', error)
    );
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.cahierDesCharges.sort((a, b) => {
      const dateA = new Date(a.dateCreation).getTime();
      const dateB = new Date(b.dateCreation).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  getArchivedCahiers(): CahierDesCharges[] {
    return this.cahierDesCharges
      ? this.cahierDesCharges.filter(cdc => cdc.archive && (!this.searchEmail || cdc.user?.email.includes(this.searchEmail)))
      : [];
  }

  openDetailsModal(id: number): void {
    this.cdcService.getById(id).subscribe(
      data => {
        this.cahier = data; // Stocker les détails du cahier dans this.cahier
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
      },
      error => console.error('Erreur lors de la récupération des détails du cahier des charges', error)
    );
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
    if (this.restoreId !== null) {
      this.cdcService.Restorer(this.restoreId).subscribe(
        () => {
          Swal.fire({
            title: 'Restauré!',
            text: "Le cahier des charges a été restauré avec succès.",
            icon: 'success'
          })
          this.ngOnInit();
          this.modalRef?.hide();
        },
        error => {
          console.error('Error deleting cahier des charges', error);
          alert('Cahier des charges not deleted!');
          this.deleteId = null;
          this.modalRef?.hide();
        }
      );
    }
  }

  confirmDelete(): void {
    if (this.deleteId !== null) {
      this.cdcService.deleteCdc(this.deleteId).subscribe(
        () => {
          Swal.fire({
            title: 'Supprimé!',
            text: "Le cahier des charges a été supprimé avec succès.",
            icon: 'success'
          })
     
          this.cahierDesCharges = this.cahierDesCharges.filter(cdc => cdc.id !== this.deleteId);
          this.deleteId = null;
               this.ngOnInit();
          this.modalRef?.hide();
        },
        error => {
          console.error('Error deleting cahier des charges', error);
          alert('Cahier des charges not deleted!');
          this.deleteId = null;
          this.modalRef?.hide();
        }
      );
    }
  }

  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;
  @ViewChild('restoreModal', { static: false }) restoreModal?: ModalDirective;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;
}
