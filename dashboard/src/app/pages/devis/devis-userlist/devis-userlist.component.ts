import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Devis } from 'src/app/core/models/Devis/devis';
import { UserModel } from 'src/app/core/models/user.models';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { UsersService } from 'src/app/core/services/users.service';
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
  isAscending : boolean =true;
  user: UserModel | null = null;
  errorMessage: string;
  userEmail = localStorage.getItem('userMail') || '';

  constructor(

    private devisService: DevisService,
    private modalService: BsModalService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void { 
 if (this.userEmail) {
      this.fetchUser(this.userEmail);
    }
  }
 
  loadDevis(user: UserModel): void {
    if (user.role === 'CLIENTADMIN') {
      // Fetch all devis for the partner
      this.devisService.getAlldevis().subscribe(
        (data) => {
          // Filter the fetched devis by partner
          this.devis = data.filter(devis => devis.user.partner.id === user.partner.id && !devis.archiveU);
          this.applyFilter();
          console.log('Loaded and filtered devis for partner:', this.devis); // Debug log
        },
        (error) => {
          console.error('Error fetching all devis for partner', error);
        }
      );
    } else {
      // Fetch devis for a specific user
      this.devisService.getByIdUser(user.id).subscribe(
        (data) => {
          this.devis = data.filter(devis => !devis.archiveU); // Filter out archived devis
          this.applyFilter();
          console.log('Loaded and filtered devis for user:', this.devis); // Debug log
        },
        (error) => {
          console.error('Error fetching user devis', error);
        }
      );
    }
  }
  fetchUser(email: string): void {
    this.usersService.getUserByEmail(email).subscribe(
        (data) => {
          this.user = data;
          this.loadDevis(data);
          console.log(this.user)
        },
        (error) => {
          console.error('Error downloading file', error);
        }
    );
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

  onYearChange(): void {
    this.applyFilter();
  }


  accepterDevis(id: number): void {
    this.devisService.acceptdevis(id).subscribe(
      (response) => {
        console.log('Cahier des charges accepté', response);
      location.reload();// Recharger les données après acceptation
      },
      (error) => {
        console.error('Error accepting cahier des charges', error);
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
          console.error('Error deleting cahier des charges', error);
          alert('Cahier des charges not deleted!');
          this.rejectId = null;
          this.modalRef?.hide();
        }
      );
    }
  }
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;
  @ViewChild('commentModal', { static: false }) commentModal?: TemplateRef<any>;


  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;

  openDetailsModal(id: number): void {
    this.devisService.getById(id).subscribe(
      (data) => {
        this.devisDetails = data; // Stocker les détails du devis dans this.devisDetails
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
          console.log('Cahier des charges refusé', response);
          location.reload(); // Recharger les données après refus
          this.modalRef?.hide();
          this.rejectId = null;
          this.commentaire = '';
        },
        (error) => {
          console.error('Error rejecting cahier des charges', error);
          this.modalRef?.hide();
        }
      );
    }
  }


}
