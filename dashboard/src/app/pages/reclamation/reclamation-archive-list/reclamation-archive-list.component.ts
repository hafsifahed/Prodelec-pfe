import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Reclamation } from 'src/app/core/models/reclamation';
import { ReclamationService } from 'src/app/core/services/Reclamation/reclamation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reclamation-archive-list',
  templateUrl: './reclamation-archive-list.component.html',
  styleUrls: ['./reclamation-archive-list.component.scss']
})
export class ReclamationArchiveListComponent {
  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];
  reclamation: Reclamation;
  modalRef?: BsModalRef;
  reponse: string = '';
  rejectId: number | null = null;
  selectedFile: File | null = null;
  p: number = 1; // Current page number
  itemsPerPage: number = 6;
  selectedYear: string = 'All';
  selectedType: string = 'All';
  searchQuery: string = '';
  isAscending : boolean = true ;
  constructor(
    private reclamationService: ReclamationService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.loadReclamation();
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredReclamations.sort((a, b) => {
      const dateA = new Date(a.dateDeCreation).getTime();
      const dateB = new Date(b.dateDeCreation).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }
  loadReclamation(): void {
    this.reclamationService.getAllreclamation().subscribe(
      (data) => {
        this.reclamations = data;
        this.applyFilter();
        console.log('Loaded reclamations:', this.reclamations); // Debug log
      },
      (error) => {
        console.error('Error fetching reclamations', error);
      }
    );
  }

  telechargerPieceJointe(fileName: string, id: number): void {
    this.reclamationService.getById(id).subscribe({
      next: (rec: Reclamation) => {
        this.reclamationService.downloadFile(fileName, rec.user).subscribe({
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
      },
      error: (error) => {
        console.error('Error fetching Cahier De Charges', error);
      }
    });
  }
  openCommentModal(id: number | undefined, template: TemplateRef<any>): void {
    if (id !== undefined && id !== null) {
      this.rejectId = id;
      console.log('Opening modal for ID:', this.rejectId); // Debug log
      this.reponse = '';
      this.modalRef = this.modalService.show(template, { class: 'modal-md' });
    } else {
      console.error('Invalid ID provided:', id);
    }
  }

  Traiter(): void {
    console.log('Traiter called with ID:', this.rejectId); // Debug log
    console.log('Response:', this.reponse); // Debug log
    if (this.rejectId !== null && this.reponse.trim()) {
      this.reclamationService.traiterRec(this.rejectId, this.reponse).subscribe(
        (response) => {
          console.log('Reclamation processed:', response);
          this.loadReclamation(); // Reload data after processing
          this.modalRef?.hide();
          this.rejectId = null;
          this.reponse = '';
        },
        (error) => {
          console.error('Error processing reclamation', error);
          this.modalRef?.hide();
        }
      );
    }
  }
  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }
  openRestoreModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmRestore(): void {
    if (this.rejectId !== null) {
      this.reclamationService.Restorer(this.rejectId).subscribe(
        () => {
          Swal.fire({
            title: 'Restauré!',
            text: "La reclamation a été restauré avec succès.",
            icon: 'success'
          })
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

  confirmDelete(): void {
    if (this.rejectId !== null) {
      this.reclamationService.deleteRec(this.rejectId).subscribe(
        () => {
          Swal.fire({
            title: 'Supprimé!',
            text: "Le cahier des charges a été supprimé avec succès.",
            icon: 'success'
          })
     
          this.reclamations = this.reclamations.filter(cdc => cdc.id_reclamation !== this.rejectId);
          this.rejectId = null;
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
  @ViewChild('restoreModal', { static: false }) restoreModal?: ModalDirective;
  @ViewChild('commentModal', { static: false }) commentModal?: TemplateRef<any>;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;
  @ViewChild('pieceJointeModal', { static: false }) pieceJointeModal?: TemplateRef<any>;

  openDetailsModal(id: number): void {
    this.reclamationService.getById(id).subscribe(
      (data) => {
        this.reclamation= data; // Stocker les détails du cahier dans this.cahier
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
        console.log(this.reclamation.reponse);
      },
      (error) => {
        console.error('Error fetching cahier des charges details', error);
      }
    );
  }

  onYearChange(): void {
    this.applyFilter();
  }

  onTypeChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredReclamations = this.reclamations;

    // Exclude archived reclamations
    this.filteredReclamations = this.filteredReclamations.filter(reclamation => reclamation.archive);

    if (this.selectedYear !== 'All') {
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => {
        const year = new Date(reclamation.dateDeCreation).getFullYear().toString();
        return year === this.selectedYear;
      });
    }

    if (this.selectedType !== 'All') {
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => reclamation.type_de_defaut === this.selectedType);
    }

    if (this.searchQuery.trim() !== '') {
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => reclamation.user.email.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
  }

  getUniqueYears(): string[] {
    const years = this.reclamations.map(reclamation => new Date(reclamation.dateDeCreation).getFullYear().toString());
    return ['All', ...Array.from(new Set(years))];
  }
}
