import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Devis } from 'src/app/core/models/Devis/devis';
import { UserModel } from 'src/app/core/models/user.models';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { UsersService } from 'src/app/core/services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devis-userlist-archive',
  templateUrl: './devis-userlist-archive.component.html',
  styleUrls: ['./devis-userlist-archive.component.scss']
})
export class DevisUserlistArchiveComponent {
  rejectId: number | null = null;
  devisDetails: Devis;
  devis: Devis[] = [];
  modalRef?: BsModalRef;
  filteredDevis: Devis[] = [];
  commentaire: string = '';
  selectedYear: string = 'All'; 
  searchQuery: string = '';
  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Items per page
  isAscending : boolean = true;

  constructor(
    private devisService: DevisService,
    private modalService: BsModalService,
    private userService: UsersService
  ) {}

  ngOnInit(): void { 
    // Instead of fetching user and manually fetching + filtering, call unified method
    this.devisService.getArchiveByUserRole().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de devis archivés',
          });
        } else {
          this.devis = data;
          this.applyFilter();
          console.log('Loaded archived devis:', this.devis);
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Erreur lors du chargement des devis archivés!',
        });
        console.error('Error fetching archived devis', error);
      }
    });
  }

  loadDevis(user: UserModel): void {
    // Removed user-based loading logic; merged into ngOnInit
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredDevis.sort((a, b) => {
      const dateA = new Date(a.dateCreation).getTime();
      const dateB = new Date(b.dateCreation).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  getNonArchivedDevis(): Devis[] {
    return this.filteredDevis.filter(devis => devis.archiveU);
  }

  applyFilter(): void {
    this.filteredDevis = this.devis.filter(devis => {
      const yearMatch = this.selectedYear === 'All' || new Date(devis.dateCreation).getFullYear().toString() === this.selectedYear;
      const searchMatch = !this.searchQuery || devis.projet.toLowerCase().includes(this.searchQuery.toLowerCase()) || devis.user?.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      return yearMatch && searchMatch;
    });
  }

  onSearchQueryChange(): void {
    this.applyFilter();
  }

  getUniqueYears(): string[] {
    const years = this.devis.map(devis => new Date(devis.dateCreation).getFullYear().toString());
    return ['All', ...Array.from(new Set(years))];
  }

  accepterDevis(id: number): void {
    this.devisService.acceptdevis(id).subscribe({
      next: () => location.reload(), // Reload after accept
      error: (error) => console.error('Error accepting devis', error)
    });
  }

  telechargerPieceJointe(fileName: string): void {
    this.devisService.downloadFile(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error downloading file', error)
    });
  }

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDelete(): void {
    if (this.rejectId !== null) {
      this.devisService.RestorerU(this.rejectId).subscribe({
        next: () => {
          Swal.fire({
            title: 'Restauré!',
            text: 'Le devis a été restauré avec succès.',
            icon: 'success'
          });
          this.ngOnInit();
          this.modalRef?.hide();
        },
        error: (error) => {
          console.error('Error restoring devis', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Le devis n\'a pas pu être restauré!',
          });
          this.rejectId = null;
          this.modalRef?.hide();
        }
      });
    }
  }

  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;
  @ViewChild('commentModal', { static: false }) commentModal?: TemplateRef<any>;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;

  openDetailsModal(id: number): void {
    this.devisService.getById(id).subscribe({
      next: (data) => {
        this.devisDetails = data; // Store details
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
      },
      error: (error) => console.error('Error fetching devis details', error)
    });
  }

  openCommentModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.commentaire = '';
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  confirmRefuserCahier(): void {
    if (this.rejectId !== null && this.commentaire.trim()) {
      this.devisService.rejectdevis(this.rejectId, this.commentaire).subscribe({
        next: () => {
          location.reload();
          this.modalRef?.hide();
          this.rejectId = null;
          this.commentaire = '';
        },
        error: (error) => {
          console.error('Error rejecting devis', error);
          this.modalRef?.hide();
        }
      });
    }
  }

  onYearChange(): void {
    this.applyFilter();
  }
}
