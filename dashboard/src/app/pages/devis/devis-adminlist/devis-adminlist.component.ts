import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Devis, EtatDevis } from 'src/app/core/models/Devis/devis';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-devis-adminlist',
  templateUrl: './devis-adminlist.component.html',
  styleUrls: ['./devis-adminlist.component.scss']
})
export class DevisAdminlistComponent implements OnInit {
  modalRef?: BsModalRef;
  rejectId: number | null = null;
  devis: Devis[] = [];
  filteredDevis: Devis[] = [];
  isAscending: boolean = true;
  devisDetails: Devis;
  selectedYear: string = 'All';
  searchQuery: string = '';
  p: number = 1;
  itemsPerPage: number = 5;
  title = 'Devis';
  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Devis', active: true }
  ];
  
  // Pour la mise à jour du fichier
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  EtatDevis = EtatDevis;
  
  searchSubject = new Subject<string>();
  commentaireRefus: string = '';

  constructor(
    private devisService: DevisService,
    private modalService: BsModalService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDevis();
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

  async loadDevis(): Promise<void> {
    try {
      const data = await this.devisService.getAlldevis().toPromise();
      if (data) {
        this.devis = data;
        this.applyFilter();
      }
    } catch (error) {
      console.error('Error fetching devis', error);
      Swal.fire('Erreur', 'Impossible de charger les devis', 'error');
    }
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredDevis.sort((a, b) => {
      return this.isAscending ? 
        new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime() :
        new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
    });
  }

  getNonArchivedDevis(): Devis[] {
    return this.filteredDevis.filter(devis => !devis.archive);
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

  getUniqueYears(): string[] {
    const years = this.devis
      .map(devis => new Date(devis.dateCreation).getFullYear().toString())
      .filter(year => year !== 'NaN');
    return ['All', ...Array.from(new Set(years))];
  }

  onYearChange(): void {
    this.applyFilter();
  }

  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;
  @ViewChild('refuseModal') refuseModal?: TemplateRef<any>;

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  openRefuseModal(template: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  confirmDelete(): void {
    if (this.rejectId !== null) {
      this.devisService.archiver(this.rejectId).subscribe(
        () => {
          Swal.fire({
            title: 'Archivé!',
            text: "Le devis a été archivé avec succès.",
            icon: 'success'
          });
          this.loadDevis();
          this.modalRef?.hide();
        },
        error => {
          console.error('Error deleting devis', error);
          Swal.fire('Erreur', 'Impossible d\'archiver le devis', 'error');
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
        this.selectedFile = null;
        this.uploadProgress = null;
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-lg' });
      },
      (error) => {
        console.error('Error fetching devis details', error);
        Swal.fire('Erreur', 'Impossible de charger les détails du devis', 'error');
      }
    );
  }

  accepterDevis(id: number): void {
    this.devisService.acceptdevis(id).subscribe(
      (response) => {
        Swal.fire('Succès!', 'Le devis a été accepté.', 'success');
        this.loadDevis();
        if (this.modalRef) {
          this.modalRef.hide();
        }
      },
      (error) => {
        console.error('Erreur lors de l\'acceptation du devis', error);
        Swal.fire('Erreur!', 'Une erreur est survenue lors de l\'acceptation', 'error');
      }
    );
  }

  refuserDevis(): void {
    if (this.rejectId !== null && this.commentaireRefus.trim()) {
      this.devisService.rejectdevis(this.rejectId, this.commentaireRefus).subscribe(
        (response) => {
          Swal.fire('Succès!', 'Le devis a été refusé.', 'success');
          this.loadDevis();
          this.modalRef?.hide();
          this.commentaireRefus = '';
          this.rejectId = null;
        },
        (error) => {
          console.error('Erreur lors du refus du devis', error);
          Swal.fire('Erreur!', 'Une erreur est survenue lors du refus', 'error');
        }
      );
    }
  }

  preparerRefus(id: number): void {
    this.rejectId = id;
    this.commentaireRefus = '';
    this.openRefuseModal(this.refuseModal!);
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }

  uploadNewPieceJointe(): void {
  if (!this.selectedFile || !this.devisDetails) {
    return;
  }

  const formData = new FormData();
  formData.append('file', this.selectedFile, this.selectedFile.name);

  this.uploadProgress = 0;
  this.http.post(`${environment.baseUrl}/devis/upload`, formData, {
    reportProgress: true,
    observe: 'events'
  }).subscribe(
    (event: any) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round(100 * event.loaded / event.total);
      } else if (event.type === HttpEventType.Response) {
        // Correction: le backend renvoie { filename: 'nom_du_fichier' }
        const fileName = event.body.filename; // <-- Correction ici

        // Mettre à jour le devis avec le nouveau nom de fichier
        this.devisService.updateDevisPieceJointe(this.devisDetails.id, fileName).subscribe(
          (updatedDevis) => {
            Swal.fire('Succès!', 'Le devis a été mis à jour avec le nouveau fichier.', 'success');
            this.devisDetails.pieceJointe = fileName;
            this.selectedFile = null;
            this.uploadProgress = null;
            this.loadDevis();
          },
          (error) => {
            console.error('Erreur lors de la mise à jour du devis', error);
            Swal.fire('Erreur!', 'Impossible de mettre à jour le devis', 'error');
            this.uploadProgress = null;
          }
        );
      }
    },
    (error) => {
      console.error('Erreur lors de l\'upload du fichier', error);
      Swal.fire('Erreur!', 'Une erreur est survenue lors de l\'envoi du fichier', 'error');
      this.uploadProgress = null;
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
}