import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { User } from 'src/app/core/models/auth.models';
import { Devis, EtatDevis } from 'src/app/core/models/Devis/devis';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import Swal from 'sweetalert2';
import { ArchiveDevisModalComponent } from '../modals/archive-devis-modal/archive-devis-modal.component';
import { RefuseDevisModalComponent } from '../modals/refuse-devis-modal/refuse-devis-modal.component';
import { DetailsDevisModalComponent } from '../modals/details-devis-modal/details-devis-modal.component';
import { NegociationDevisModalComponent } from '../modals/negociation-devis-modal/negociation-devis-modal.component';

@Component({
  selector: 'app-devis-userlist',
  templateUrl: './devis-userlist.component.html',
  styleUrls: ['./devis-userlist.component.scss']
})
export class DevisUserlistComponent {
  devisDetails: Devis;
  devis: Devis[] = [];
  modalRef?: BsModalRef;
  filteredDevis: Devis[] = [];
  selectedYear: string = 'All'; 
  searchQuery: string = '';
  p: number = 1;
  itemsPerPage: number = 5;
  isAscending: boolean = true;
  user: User | null = null;
  EtatDevis = EtatDevis;

  constructor(
    private devisService: DevisService,
    private modalService: BsModalService,
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
          this.devis = data.filter(devis => 
            devis.user.partner?.id === user.partner?.id && !devis.archiveU
          );
          this.applyFilter();
        },
        (error) => {
          console.error('Error fetching all devis for partner', error);
          Swal.fire('Erreur', 'Impossible de charger les devis', 'error');
        }
      );
    } else {
      this.devisService.getByIdUser(user.id).subscribe(
        (data) => {
          this.devis = data.filter(devis => !devis.archiveU);
          this.applyFilter();
        },
        (error) => {
          console.error('Error fetching user devis', error);
          Swal.fire('Erreur', 'Impossible de charger vos devis', 'error');
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
      const yearMatch = this.selectedYear === 'All' || 
        new Date(devis.dateCreation).getFullYear().toString() === this.selectedYear;
      const searchMatch = !this.searchQuery || 
        devis.projet.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (devis.user?.email && devis.user.email.toLowerCase().includes(this.searchQuery.toLowerCase()));
      return yearMatch && searchMatch;
    });
  }

  onSearchQueryChange(): void {
    this.applyFilter();
  }

  getUniqueYears(): string[] {
    const years = this.devis
      .map(devis => new Date(devis.dateCreation).getFullYear().toString())
      .filter(year => year !== 'NaN');
    return ['All', ...Array.from(new Set(years))];
  }

  onYearChange(): void {
    this.applyFilter();
  }

  accepterDevis(id: number): void {
    this.devisService.acceptdevis(id).subscribe(
      (response) => {
        Swal.fire('Succès', 'Le devis a été accepté avec succès.', 'success');
        if (this.user) {
          this.loadDevis(this.user);
        }
      },
      (error) => {
        console.error('Error accepting devis', error);
        Swal.fire('Erreur', 'Une erreur est survenue lors de l\'acceptation du devis', 'error');
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
          Swal.fire('Fichier introuvable', `Le fichier ${fileName} n'existe pas sur le serveur.`, 'error');
        } else {
          Swal.fire('Erreur', 'Une erreur est survenue lors du téléchargement', 'error');
        }
      }
    });
  }

  openDeleteModal(id: number): void {
  const initialState = { archiveId: id };
  this.modalRef = this.modalService.show(ArchiveDevisModalComponent, { initialState });
  this.modalRef.content.onArchived.subscribe(() => {
    if (this.user) this.loadDevis(this.user);
  });
}

  openNegociationModal(id: number): void {
  const initialState = { negociationId: id };
  this.modalRef = this.modalService.show(NegociationDevisModalComponent, { initialState });
  this.modalRef.content.onNegociationStarted.subscribe(() => {
    if (this.user) this.loadDevis(this.user);
  });
}


  openDetailsModal(id: number): void {
  this.devisService.getById(id).subscribe(
    (data) => {
      const initialState = { devis: data };
      this.modalRef = this.modalService.show(DetailsDevisModalComponent, { initialState });
      this.modalRef.content.onDownload.subscribe((fileName: string) => {
        this.telechargerPieceJointe(fileName);
      });
    },
    (error) => {
      console.error('Error fetching devis details', error);
      Swal.fire('Erreur', 'Impossible de charger les détails du devis', 'error');
    }
  );
}

  openCommentModal(id: number): void {
  const initialState = { refuseId: id };
  this.modalRef = this.modalService.show(RefuseDevisModalComponent, { initialState });
  this.modalRef.content.onRefused.subscribe(() => {
    if (this.user) this.loadDevis(this.user);
  });
}

}