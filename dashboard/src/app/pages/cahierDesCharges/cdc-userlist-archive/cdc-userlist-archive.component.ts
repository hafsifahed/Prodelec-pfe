import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cdc-userlist-archive',
  templateUrl: './cdc-userlist-archive.component.html',
  styleUrls: ['./cdc-userlist-archive.component.scss']
})
export class CDCUserlistArchiveComponent {
  cahierDesCharges: CahierDesCharges[] = [];
  cahier: CahierDesCharges;
  modalRef?: BsModalRef;
  submitted = false;
  deleteId: number | null = null;
  searchTitle: string = '';
  filterYear: string = '';
  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Items per page
  isAscending: boolean = true;

  constructor(
    private cdcService: CdcServiceService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    this.cdcService.getArchiveByUserRole().subscribe({
      next: (data) => {
        console.log(data);
        if (!data || data.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de cahiers des charges archivés',
          });
        } else {
          this.cahierDesCharges = data;
          console.log('Loaded archived CDCs:', this.cahierDesCharges);
        }
      },
      error: (error) => {
        console.error('Error fetching archived CDCs', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Il y a un problème lors du chargement des cahiers des charges!',
        });
      }
    });
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.cahierDesCharges.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  getNonArchivedCahiers(): CahierDesCharges[] {
    return this.cahierDesCharges ? this.cahierDesCharges.filter(cdc =>
      cdc.archiveU &&
      (!this.searchTitle || cdc.titre.toLowerCase().includes(this.searchTitle.toLowerCase())) &&
      (!this.filterYear || new Date(cdc.createdAt).getFullYear().toString() === this.filterYear)
    ) : [];
  }

  getAvailableYears(): string[] {
    const years = this.cahierDesCharges.map(cdc => new Date(cdc.createdAt).getFullYear().toString());
    return Array.from(new Set(years));
  }

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.deleteId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDelete(): void {
    if (this.deleteId !== null) {
      this.cdcService.restorerU(this.deleteId).subscribe({
        next: () => {
          Swal.fire({
            title: 'Restauré!',
            text: 'Le cahier des charges a été restauré avec succès.',
            icon: 'success'
          });
          this.ngOnInit();
          this.modalRef?.hide();
        },
        error: (error) => {
          console.error('Error restoring cahier des charges', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Le cahier des charges n\'a pas pu être restauré!',
          });
          this.deleteId = null;
          this.modalRef?.hide();
        }
      });
    }
  }

  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('removeItemModal', { static: false }) removeItemModal?: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;
  @ViewChild('addCdcModal') addCdcModal!: TemplateRef<any>;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;

  openDetailsModal(id: number): void {
    this.cdcService.getById(id).subscribe({
      next: (data) => {
        this.cahier = data;
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
      },
      error: (error) => {
        console.error('Error fetching cahier des charges details', error);
      }
    });
  }

  openViewModal(content: any) {
    this.modalRef = this.modalService.show(content);
  }

  openModal(content: any) {
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
  }

  handleCahierDesChargesAdded() {
    Swal.fire({
      title: 'Ajouté!',
      text: 'Le cahier des charges a été ajouté avec succès.',
      icon: 'success'
    }).then(() => {
      this.modalRef?.hide();
      console.log('from modal !!!!');
    });
  }
}
