import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

  @ViewChild('commentModal', { static: false }) commentModal?: TemplateRef<any>;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;
  @ViewChild('pieceJointeModal', { static: false }) pieceJointeModal?: TemplateRef<any>;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;
  @ViewChild('incompleteModal', { static: false }) incompleteModal?: TemplateRef<any>;

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

 /* accepterCahier(id: number): void {
    this.cdcService.acceptCdc(id).subscribe({
      next: () => {
        Swal.fire('Accepté', 'Cahier des charges accepté avec succès', 'success');
        this.loadCahiersDesCharges();

        // Récupération des détails du CDC pour le formulaire d'ajout de devis
        this.cdcService.getById(id).subscribe({
          next: (cahier) => {
            this.cahier = cahier;
            this.selectedFile = null;
            this.numdevis = '';
            this.modalRef = this.modalService.show(this.pieceJointeModal!, { class: 'modal-md' });
          },
          error: (error) => {
            console.error('Erreur chargement cahier des charges pour devis', error);
            // Optionnel : afficher un message à l'utilisateur
          }
        });
      },
      error: (error) => {
        console.error('Error accepting cahier des charges', error);
        Swal.fire('Erreur', 'Erreur lors de l\'acceptation', 'error');
      }
    });
  }*/

  refuserCahier(id: number): void {
    const commentaire = prompt('Veuillez entrer un commentaire pour le refus :');
    if (commentaire && commentaire.trim()) {
      this.cdcService.rejectCdc(id, commentaire).subscribe({
        next: () => {
          Swal.fire('Refusé', 'Cahier des charges refusé avec succès', 'success');
          this.loadCahiersDesCharges();
        },
        error: (error) => {
          console.error('Error rejecting cahier des charges', error);
          Swal.fire('Erreur', 'Erreur lors du refus', 'error');
        }
      });
    }
  }

  openIncompleteModal(id: number, template: TemplateRef<any>): void {
    this.incompleteId = id;
    this.commentaire = '';
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  confirmMarkAsIncomplete(): void {
    if (this.incompleteId !== null && this.commentaire.trim()) {
      this.cdcService.markAsIncomplete(this.incompleteId, this.commentaire).subscribe({
        next: () => {
          Swal.fire('Mis à jour', 'Le cahier des charges a été marqué comme "À compléter".', 'success');
          this.loadCahiersDesCharges();
          this.modalRef?.hide();
          this.incompleteId = null;
          this.commentaire = '';
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          Swal.fire('Erreur', 'Erreur lors de la mise à jour du cahier des charges.', 'error');
          this.modalRef?.hide();
        }
      });
    } else {
      Swal.fire('Attention', 'Veuillez saisir un commentaire valide.', 'warning');
    }
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

  openCommentModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.commentaire = '';
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  confirmRefuserCahier(): void {
    if (this.rejectId !== null && this.commentaire.trim()) {
      this.cdcService.rejectCdc(this.rejectId, this.commentaire).subscribe({
        next: () => {
          Swal.fire('Refusé', 'Cahier des charges refusé avec succès', 'success');
          this.loadCahiersDesCharges();
          this.modalRef?.hide();
          this.rejectId = null;
          this.commentaire = '';
        },
        error: (error) => {
          console.error('Error rejecting cahier des charges', error);
          this.modalRef?.hide();
          Swal.fire('Erreur', 'Erreur lors du refus', 'error');
        }
      });
    } else {
      Swal.fire('Attention', 'Veuillez saisir un commentaire valide', 'warning');
    }
  }

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDelete(): void {
    if (this.rejectId !== null) {
      this.cdcService.archiver(this.rejectId).subscribe({
        next: () => {
          Swal.fire('Archivé!', 'Le cahier des charges a été archivé avec succès.', 'success');
          this.loadCahiersDesCharges();
          this.modalRef?.hide();
          this.rejectId = null;
        },
        error: (error) => {
          console.error('Error archiving cahier des charges', error);
          Swal.fire('Erreur', 'Erreur lors de l\'archivage', 'error');
          this.modalRef?.hide();
          this.rejectId = null;
        }
      });
    }
  }

  openDetailsModal(id: number): void {
    this.cdcService.getById(id).subscribe({
      next: (data) => {
        this.cahier = data;
        this.pdfUrl = null;
        if (this.cahier.files && this.cahier.files.length > 0) {
          // Charge premier PDF présent
          const pdfFile = this.cahier.files.find(f => f.nomFichier.toLowerCase().endsWith('.pdf'));
          if (pdfFile) {
            this.loadPDF(pdfFile.nomFichier);
          }
        }
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-lg' });
      },
      error: (error) => {
        console.error('Error fetching cahier des charges details', error);
        Swal.fire('Erreur', 'Erreur lors de la récupération des détails', 'error');
      }
    });
  }

  openPieceJointeModal(cdcId: number): void {
    this.cdcService.getById(cdcId).subscribe({
      next: (cahier) => {
        this.cahier = cahier;
        this.selectedFile = null;
        this.numdevis = '';
        this.modalRef = this.modalService.show(this.pieceJointeModal!, { class: 'modal-md' });
      },
      error: (error) => {
        console.error('Error fetching cahier des charges details', error);
        Swal.fire('Erreur', 'Erreur lors de la récupération du cahier', 'error');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  accepterCahier(id: number): void {
  this.cdcService.getById(id).subscribe({
    next: (cahier) => {
      this.cahier = cahier;
      this.selectedFile = null;
      this.numdevis = '';
      this.modalRef = this.modalService.show(this.pieceJointeModal!, { class: 'modal-md' });
    },
    error: (error) => {
      console.error('Erreur chargement cahier des charges pour devis', error);
      Swal.fire('Erreur', 'Erreur lors du chargement du cahier des charges', 'error');
    }
  });
}

submitDevis(): void {
  if (this.cahier && this.selectedFile && this.numdevis.trim()) {
    this.devisService.uploadFile(this.selectedFile).subscribe({
      next: (uploadResponse: any) => {
        const filename = uploadResponse.filename || uploadResponse;
        this.devisService.saveDevis(this.cahier!.id!, filename, this.numdevis).subscribe({
          next: () => {
            Swal.fire('Ajouté!', 'Le devis a été ajouté avec succès.', 'success').then(() => {
              this.modalRef?.hide();
              this.loadCahiersDesCharges();
            });
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout du devis:', error);
            Swal.fire('Erreur', 'Erreur lors de l\'ajout du devis', 'error');
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload du fichier:', error);
        Swal.fire('Erreur', 'Erreur lors de l\'upload du fichier', 'error');
      }
    });
  } else {
    Swal.fire('Erreur', 'Veuillez compléter tous les champs requis.', 'warning');
  }
}

}
