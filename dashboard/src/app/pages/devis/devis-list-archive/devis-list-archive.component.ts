import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Devis } from 'src/app/core/models/Devis/devis';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devis-list-archive',
  templateUrl: './devis-list-archive.component.html',
  styleUrls: ['./devis-list-archive.component.scss']
})
export class DevisListArchiveComponent implements OnInit {
  modalRef?: BsModalRef;
  devis: Devis[] = [];
  deleteId: number | null = null;
  restoreId: number | null = null;
  filteredDevis: Devis[] = [];
  isAscending: boolean = true;
  devisDetails: Devis;
  selectedYear: string = 'All'; // Default to 'All' to show all years
  searchQuery: string = ''; // Search query for client or project
  p: number = 1; // Current page number
  itemsPerPage: number = 5;
  pdfUrl: string | null = null;

  constructor(
    private devisService: DevisService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.loadDevis();
  }

  loadDevis(): void {
    // Use new unified service method to fetch archived devis filtered by user role
    this.devisService.getArchiveByUserRole().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de devis archivés',
          });
          this.devis = [];
          this.filteredDevis = [];
        } else {
          this.devis = data;
          this.applyFilter();
        }
      },
      error: (error) => {
        console.error('Error fetching archived devis', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Erreur lors du chargement des devis archivés!',
        });
      }
    });
  }

  loadPDF(): void {
    if (this.devisDetails?.pieceJointe) {
      this.devisService.getFileUrl(this.devisDetails.pieceJointe).subscribe({
        next: (blob: Blob) => {
          this.pdfUrl = URL.createObjectURL(blob);
        },
        error: (error) => {
          console.error('Error loading file', error);
        }
      });
    }
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredDevis.sort((a, b) => {
      const dateA = new Date(a.dateCreation).getTime();
      const dateB = new Date(b.dateCreation).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  getArchivedDevis(): Devis[] {
    return this.filteredDevis; // Already filtered on loadDevis()
  }

  applyFilter(): void {
    this.filteredDevis = this.devis.filter(devis => {
      const yearMatch = this.selectedYear === 'All' || new Date(devis.dateCreation).getFullYear().toString() === this.selectedYear;
      const searchMatch = !this.searchQuery || devis.projet.toLowerCase().includes(this.searchQuery.toLowerCase()) || devis.user?.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      return yearMatch && searchMatch;
    });
  }

  getUniqueYears(): string[] {
    const years = this.devis.map(devis => new Date(devis.dateCreation).getFullYear().toString());
    return ['All', ...Array.from(new Set(years))];
  }

  onYearChange(): void {
    this.applyFilter();
  }

  onSearchQueryChange(): void {
    this.applyFilter();
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
      this.devisService.Restorer(this.restoreId).subscribe({
        next: () => {
          Swal.fire({
            title: 'Restauré!',
            text: "Devis a été restauré avec succès.",
            icon: 'success'
          });
          this.loadDevis();
          this.modalRef?.hide();
        },
        error: (error) => {
          console.error('Error restoring devis', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Le devis n'a pas pu être restauré!",
          });
          this.restoreId = null;
          this.modalRef?.hide();
        }
      });
    }
  }

  confirmDelete(): void {
    if (this.deleteId !== null) {
      this.devisService.deleteDevis(this.deleteId).subscribe({
        next: () => {
          Swal.fire({
            title: 'Supprimé!',
            text: "Devis a été supprimé avec succès.",
            icon: 'success'
          });
          this.devis = this.devis.filter(d => d.id !== this.deleteId);
          this.deleteId = null;
          this.loadDevis();
          this.modalRef?.hide();
        },
        error: (error) => {
          console.error('Error deleting devis', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Le devis n'a pas pu être supprimé!",
          });
          this.deleteId = null;
          this.modalRef?.hide();
        }
      });
    }
  }

  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;
  @ViewChild('restoreModal', { static: false }) restoreModal?: ModalDirective;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;

  openDetailsModal(id: number): void {
    this.devisService.getById(id).subscribe({
      next: (data) => {
        this.devisDetails = data;
        this.loadPDF(); 
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-lg' });
      },
      error: (error) => {
        console.error('Error fetching devis details', error);
      }
    });
  }
}
