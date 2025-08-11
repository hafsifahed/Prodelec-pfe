import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ArchiveCdcModalComponent } from '../modals/archive-cdc-modal/archive-cdc-modal.component';
import { RefuseCdcModalComponent } from '../modals/refuse-cdc-modal/refuse-cdc-modal.component';
import { IncompleteCdcModalComponent } from '../modals/incomplete-cdc-modal/incomplete-cdc-modal.component';
import { DetailsCdcAdminModalComponent } from '../modals/details-cdc-admin-modal/details-cdc-admin-modal.component';
import { AddDevisModalComponent } from '../modals/add-devis-modal/add-devis-modal.component';

@Component({
  selector: 'app-cdc-list-admin',
  templateUrl: './cdc-list-admin.component.html',
  styleUrls: ['./cdc-list-admin.component.scss']
})
export class CDCListAdminComponent {
  cahiersDesCharges: CahierDesCharges[] = [];
  filteredCahiersDesCharges: CahierDesCharges[] = [];

  modalRef?: BsModalRef;
  commentaire: string = '';
  rejectId: number | null = null;
  incompleteId: number | null = null;
  cahier?: CahierDesCharges;
  selectedFile: File | null = null;
  searchQuery: string = '';

  p: number = 1;
  itemsPerPage: number = 5;
  selectedYear: string = 'All';
  isAscending: boolean = true;
  pdfUrl: string | null = null;
  loadingPdf: boolean = false;
  pdfError: string | null = null;

  searchSubject = new Subject<string>();
  numdevis: string = '';

  constructor(
    private cdcService: CdcServiceService,
    private devisService: DevisService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.loadCahiersDesCharges();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilter());
  }

  onSearchQueryChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  loadCahiersDesCharges(): void {
    this.cdcService.getAllCdc().subscribe({
      next: (data) => {
        this.cahiersDesCharges = data;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error fetching cahiers des charges', error);
        Swal.fire('Erreur', 'Erreur lors du chargement des cahiers des charges', 'error');
      }
    });
  }

  applyFilter(): void {
    const searchTerm = this.searchQuery.toLowerCase();
    this.filteredCahiersDesCharges = this.cahiersDesCharges.filter(cahier => {
      if (this.selectedYear !== 'All' && new Date(cahier.createdAt ?? '').getFullYear().toString() !== this.selectedYear) {
        return false;
      }
      const titreMatches = cahier.titre?.toLowerCase().includes(searchTerm);
      const emailMatches = cahier.user?.email?.toLowerCase().includes(searchTerm);
      return titreMatches || emailMatches;
    });
  }

  getUniqueYears(): string[] {
    const years = this.cahiersDesCharges
      .map(cahier => new Date(cahier.createdAt ?? '').getFullYear().toString());
    return ['All', ...Array.from(new Set(years))];
  }

  getNonArchivedCahiers(): CahierDesCharges[] {
    return this.filteredCahiersDesCharges.filter(cdc => !cdc.archive);
  }

  onYearChange(): void {
    this.applyFilter();
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredCahiersDesCharges.sort((a, b) => {
      return this.isAscending
        ? new Date(a.createdAt ?? '').getTime() - new Date(b.createdAt ?? '').getTime()
        : new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime();
    });
  }


  openIncompleteModal(id: number): void {
  const initialState = { incompleteId: id };
  this.modalRef = this.modalService.show(IncompleteCdcModalComponent, { initialState });
  this.modalRef.content.onMarkedIncomplete.subscribe(() => {
    this.loadCahiersDesCharges();
  });
}


  loadPDF(fileName: string): void {
    if (!this.cahier || !this.cahier.user) return;

    this.loadingPdf = true;
    this.pdfError = null;
    this.cdcService.downloadFile(fileName, this.cahier.user).subscribe({
      next: (blob) => {
        this.pdfUrl = URL.createObjectURL(blob);
        this.loadingPdf = false;
      },
      error: (error) => {
        console.error('Error loading PDF', error);
        this.pdfError = 'Erreur lors du chargement du PDF';
        this.loadingPdf = false;
      }
    });
  }

  telechargerPieceJointe(fileName: string, id: number): void {
    this.cdcService.getById(id).subscribe({
      next: (cahier) => {
        if (cahier.user) {
          this.cdcService.downloadFile(fileName, cahier.user).subscribe({
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
            error: (error) => {
              console.error('Error downloading file', error);
              if (error.status === 404) {
                Swal.fire('Erreur', 'Fichier non trouvé : ' + fileName, 'error');
              }
            }
          });
        } else {
          Swal.fire('Erreur', 'Utilisateur associé au cahier non trouvé', 'error');
        }
      },
      error: (error) => {
        console.error('Error fetching Cahier Des Charges', error);
        Swal.fire('Erreur', 'Erreur lors de la récupération du cahier des charges', 'error');
      }
    });
  }

  openCommentModal(id: number): void {
  const initialState = { rejectId: id };
  this.modalRef = this.modalService.show(RefuseCdcModalComponent, { initialState });
  this.modalRef.content.onRefused.subscribe(() => {
    this.loadCahiersDesCharges();
  });
}

 

  openDeleteModal(id: number): void {
  const initialState = { archiveId: id };
  this.modalRef = this.modalService.show(ArchiveCdcModalComponent, { initialState });
  this.modalRef.content.onArchived.subscribe(() => {
    this.loadCahiersDesCharges();
  });
}

 

  openDetailsModal(id: number): void {
  this.cdcService.getById(id).subscribe({
    next: (data) => {
      const initialState = { cahier: data };
      this.modalRef = this.modalService.show(DetailsCdcAdminModalComponent, { 
        initialState,
        class: 'modal-lg'
      });
      this.modalRef.content.onFileDownload.subscribe((event: {fileName: string, id: number}) => {
        this.telechargerPieceJointe(event.fileName, event.id);
      });
    },
    error: (error) => console.error('Error fetching details', error)
  });
}

  openPieceJointeModal(cdcId: number): void {
  this.cdcService.getById(cdcId).subscribe({
    next: (cahier) => {
      const initialState = { cahier };
      this.modalRef = this.modalService.show(AddDevisModalComponent, { initialState });
      this.modalRef.content.onDevisAdded.subscribe(() => {
        this.loadCahiersDesCharges();
      });
    },
    error: (error) => console.error('Error fetching CDC', error)
  });
}



}
