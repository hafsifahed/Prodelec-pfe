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
export class DevisListArchiveComponent {
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
    this.devisService.getAlldevis().subscribe(
      (data) => {
        this.devis = data;
        this.applyFilter(); // Apply filter initially
      },
      (error) => {
        console.error('Error fetching devis', error);
      }
    );
  }
  loadPDF(): void {
    if (this.devisDetails?.pieceJointe) {
      this.devisService.getFileUrl(this.devisDetails.pieceJointe).subscribe(
        (blob: Blob) => {
          this.pdfUrl = URL.createObjectURL(blob);
        },
        (error) => {
          console.error('Error loading file', error);
          // Gérer l'erreur si nécessaire
        }
      );
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
    return this.filteredDevis.filter(devis => devis.archive);
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
      this.devisService.Restorer(this.restoreId).subscribe(
        () => {
          Swal.fire({
            title: 'Restauré!',
            text: "Devis a été restauré avec succès.",
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
      this.devisService.deleteDevis(this.deleteId).subscribe(
        () => {
          Swal.fire({
            title: 'Supprimé!',
            text: "Devis a été supprimé avec succès.",
            icon: 'success'
          })
     
          this.devis = this.devis.filter(cdc => cdc.id !== this.deleteId);
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

  openDetailsModal(id: number): void {
    this.devisService.getById(id).subscribe(
      (data) => {
        this.devisDetails = data;
        this.loadPDF(); 
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-lg' });
      },
      (error) => {
        console.error('Error fetching devis details', error);
      }
    );
  }
}
