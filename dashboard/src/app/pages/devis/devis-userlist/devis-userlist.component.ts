import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { User } from 'src/app/core/models/auth.models';
import { Devis } from 'src/app/core/models/Devis/devis';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { UsersService } from 'src/app/core/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devis-userlist',
  templateUrl: './devis-userlist.component.html',
  styleUrls: ['./devis-userlist.component.scss']
})
export class DevisUserlistComponent {
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
  user: User | null = null;
  errorMessage: string;
  
  negociationId: number | null = null;

  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;
  @ViewChild('commentModal', { static: false }) commentModal?: TemplateRef<any>;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;
  @ViewChild('negociationModal') negociationModal?: TemplateRef<any>;

  constructor(
    private devisService: DevisService,
    private modalService: BsModalService,
    private usersService: UsersService,
    private userStateService: UserStateService
  ) {}

  ngOnInit(): void { 
    this.userStateService.user$.subscribe(user => {
      this.user = user;
      this.loadDevis(user);
    });
  }
  
  loadDevis(user: User): void {
    if (user.role.name === 'CLIENTADMIN') {
      this.devisService.getAlldevis().subscribe(
        (data) => {
          this.devis = data.filter(devis => devis.user.partner.id === user.partner.id && !devis.archiveU);
          this.applyFilter();
          console.log('Loaded and filtered devis for partner:', this.devis);
        },
        (error) => {
          console.error('Error fetching all devis for partner', error);
        }
      );
    } else {
      this.devisService.getByIdUser(user.id).subscribe(
        (data) => {
          this.devis = data.filter(devis => !devis.archiveU);
          this.applyFilter();
          console.log('Loaded and filtered devis for user:', this.devis);
        },
        (error) => {
          console.error('Error fetching user devis', error);
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

  getNonArchivedDevis(): Devis[] {
    return this.filteredDevis.filter(devis => !devis.archiveU);
  }

  applyFilter(): void {
    this.filteredDevis = this.devis.filter(devis => {
      const yearMatch = this.selectedYear === 'All' || new Date(devis.dateCreation).getFullYear().toString() === this.selectedYear;
      const searchMatch = !this.searchQuery || 
        devis.projet.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        devis.user?.email.toLowerCase().includes(this.searchQuery.toLowerCase());
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

  onYearChange(): void {
    this.applyFilter();
  }

  accepterDevis(id: number): void {
    this.devisService.acceptdevis(id).subscribe(
      (response) => {
        console.log('Devis accepté', response);
        location.reload(); // Recharger les données
      },
      (error) => {
        console.error('Error accepting devis', error);
      }
    );
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
      },
      error: (error) => {
        console.error('Error downloading file', error);
        if (error.status === 404) {
          console.error('File not found:', fileName);
        }
      }
    });
  }

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  openNegociationModal(id: number, template: TemplateRef<any>): void {
    this.negociationId = id;
    this.commentaire = '';
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  confirmDelete(): void {
    if (this.rejectId !== null) {
      this.devisService.archiverU(this.rejectId).subscribe(
        () => {
          Swal.fire({
            title: 'Archivé!',
            text: "Devis a été archivé avec succès.",
            icon: 'success'
          });
          this.ngOnInit();
          this.modalRef?.hide();
        },
        error => {
          console.error('Error deleting devis', error);
          alert('Devis non archivé!');
          this.rejectId = null;
          this.modalRef?.hide();
        }
      );
    }
  }

  openDetailsModal(id: number): void {
    this.devisService.getById(id).subscribe(
      (data) => {
        this.devisDetails = data;
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
      },
      (error) => {
        console.error('Error fetching devis details', error);
      }
    );
  }

  openCommentModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.commentaire = '';
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  confirmRefuserCahier(): void {
    if (this.rejectId !== null && this.commentaire.trim()) {
      this.devisService.rejectdevis(this.rejectId, this.commentaire).subscribe(
        (response) => {
          console.log('Devis refusé', response);
          location.reload();
          this.modalRef?.hide();
          this.rejectId = null;
          this.commentaire = '';
        },
        (error) => {
          console.error('Error rejecting devis', error);
          this.modalRef?.hide();
        }
      );
    }
  }

  confirmCommencerNegociation(): void {
    if (this.negociationId !== null) {
      this.devisService.negocierDevis(this.negociationId, this.commentaire).subscribe({
        next: (updatedDevis) => {
          Swal.fire('Mise à jour', 'Le devis est maintenant en négociation.', 'success');
          if (this.user) {
            this.loadDevis(this.user);
          }
          this.modalRef?.hide();
          this.negociationId = null;
          this.commentaire = '';
        },
        error: (error) => {
          console.error('Erreur lors du démarrage de la négociation', error);
          Swal.fire('Erreur', 'Impossible de commencer la négociation.', 'error');
        }
      });
    } else {
      Swal.fire('Attention', 'Aucun devis sélectionné pour la négociation.', 'warning');
    }
  }
}
