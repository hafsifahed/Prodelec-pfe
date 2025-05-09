import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { Devis } from 'src/app/core/models/Devis/devis';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
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
  cahier: CahierDesCharges;
  selectedFile: File | null = null;
  searchQuery: string = '';
  addForm: FormGroup;
  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Items per page
  selectedYear: string = 'All'; // Default to 'All' to show all years
  isAscending: boolean = true;
  pdfUrl: string | null = null;
  loadingPdf: boolean = false;
  pdfError: string | null = null;
  searchSubject = new Subject<string>();
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

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredCahiersDesCharges.sort((a, b) => {
      return this.isAscending ? 
        new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime() :
        new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
    });
  }



  async loadCahiersDesCharges(): Promise<void> {
    try {
      this.cahiersDesCharges = await this.cdcService.getAllCdc().toPromise();
      this.applyFilter();
    } catch (error) {
      console.error('Error fetching cahiers des charges', error);
    }
  }

  getNonArchivedCahiers(): CahierDesCharges[] {
    return this.cahiersDesCharges ? this.filteredCahiersDesCharges.filter(cdc => !cdc.archive) : [];
  }
  onYearChange(): void {
    this.applyFilter();
  }


  applyFilter(): void {
    const searchTerm = this.searchQuery.toLowerCase();
    this.filteredCahiersDesCharges = this.cahiersDesCharges.filter(cahier => {
      if (this.selectedYear !== 'All' && new Date(cahier.dateCreation).getFullYear().toString() !== this.selectedYear) {
        return false;
      }
      return cahier.titre.toLowerCase().includes(searchTerm) || 
             (cahier.user && cahier.user.email.toLowerCase().includes(searchTerm));
    });
  }
  getUniqueYears(): string[] {
    const years = this.cahiersDesCharges.map(cahier => new Date(cahier.dateCreation).getFullYear().toString());
    return ['All', ...Array.from(new Set(years))];
  }

  accepterCahier(id: number): void {
    this.cdcService.acceptCdc(id).subscribe(
      (response) => {
        console.log('Cahier des charges accepté', response);
        this.loadCahiersDesCharges(); // Recharger les données après acceptation
      },
      (error) => {
        console.error('Error accepting cahier des charges', error);
      }
    );
  }

  refuserCahier(id: number): void {
    const commentaire = prompt('Veuillez entrer un commentaire pour le refus:');
    if (commentaire) {
      this.cdcService.rejectCdc(id, commentaire).subscribe(
        (response) => {
          console.log('Cahier des charges refusé', response);
          this.loadCahiersDesCharges(); // Recharger les données après refus
        },
        (error) => {
          console.error('Error rejecting cahier des charges', error);
        }
      );
    }
  }

  async loadPDF(): Promise<void> {
  if (this.cahier?.pieceJointe) {
    try {
      const blob = await this.cdcService.downloadFile(this.cahier.pieceJointe,this.cahier.user).toPromise();
      this.pdfUrl = URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error loading file', error);
    }
  }
}
telechargerPieceJointe(fileName: string, id: number): void {
  this.cdcService.getById(id).subscribe({
    next: (cahierDeCharges: CahierDesCharges) => {
      this.cdcService.downloadFile(fileName, cahierDeCharges.user).subscribe({
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

  

  openCommentModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.commentaire = '';
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  confirmRefuserCahier(): void {
    if (this.rejectId !== null && this.commentaire.trim()) {
      this.cdcService.rejectCdc(this.rejectId, this.commentaire).subscribe(
        (response) => {
          console.log('Cahier des charges refusé', response);
          this.loadCahiersDesCharges(); // Recharger les données après refus
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

  @ViewChild('commentModal', { static: false }) commentModal?: TemplateRef<any>;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;
  @ViewChild('pieceJointeModal', { static: false }) pieceJointeModal?: TemplateRef<any>;
  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDelete(): void {
    if (this.rejectId !== null) {
      this.cdcService.archiver(this.rejectId).subscribe(
        () => {
          Swal.fire({
            title: 'Archivé!',
            text: "Le cahier des charges a été archivé avec succès.",
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
  openDetailsModal(id: number): void {
    this.cdcService.getById(id).subscribe(
      (data) => {
        this.cahier = data;
        console.log("aaaaaaaa",data.user.partner)
        this.loadPDF();  // Stocker les détails du cahier dans this.cahier
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-lg' });
       
      },
      (error) => {
        console.error('Error fetching cahier des charges details', error);
      }
    );
  }

  openPieceJointeModal(cdcId: number): void {
    this.cdcService.getById(cdcId).subscribe(
      (cahier) => {
        this.cahier = cahier;
        this.modalRef = this.modalService.show(this.pieceJointeModal!);
      },
      (error) => {
        console.error('Error fetching cahier des charges details', error);
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  submitDevis(): void {
    if (this.cahier && this.selectedFile) {
      console.log('Cahier des charges:', this.cahier);
      console.log('Fichier sélectionné:', this.selectedFile);
  
      const devis: Devis = {
        id: 0,
        projet: this.cahier.titre || '',
        pieceJointe: this.selectedFile.name || '',
        commentaire: '',
        etat: 'En attente',
        archive: false,
        archiveU: false,
        dateCreation: new Date(),
        user: this.cahier.user,
        cahierDesCharges: this.cahier
      };
  
      this.devisService.saveDevis(this.cahier.id,devis.pieceJointe).subscribe(
        (response) => {
          console.log('Réponse du service addDevis :', response);
          if (response) {
            console.log('Devis ajouté avec succès', response);
            this.accepterCahier(this.cahier.id); // Accepter le cahier des charges après avoir ajouté le devis
            this.saveCahierDesCharges(); 
            Swal.fire({
              title: 'Ajouté!',
              text: "La Devis  a été ajouté avec succès.",
              icon: 'success'
            }).then(() => {
              this.modalRef?.hide(); // Fermer le modal après l'ajout réussi
            });// Sauvegarde du cahier des charges si nécessaire
          } else {
            console.error('Réponse du service addDevis est null ou vide');
          }
        },
        (error) => {
          console.log('Objet d\'erreur complet:', error); // Journaliser l'objet d'erreur complet
  
          if (error) {
            if (error.message) {
              console.error('Erreur lors de l\'ajout du devis:', error.message);
            } else if (error.error && error.error.message) {
              // Certains frameworks retournent l'erreur dans une propriété "error"
              console.error('Erreur lors de l\'ajout du devis:', error.error.message);
            } else {
              console.error('Erreur lors de l\'ajout du devis:', JSON.stringify(error));
            }
          } else {
            console.error('Erreur lors de l\'ajout du devis : une erreur inconnue s\'est produite');
          }
        }
      );
    } else {
      console.error('Erreur : Cahier des charges ou pièce jointe non sélectionnés.');
    }
  }
  
  
  
  
  
  saveCahierDesCharges() {
    if (this.selectedFile) {
      this.devisService.uploadFile(this.selectedFile).subscribe(
        (filename) => {
          console.log('Pièce jointe téléchargée avec succès', filename);
          // Vous pouvez effectuer des actions supplémentaires après le téléchargement réussi de la pièce jointe
        },
        (error) => {
          console.error('Error uploading file', error);
        }
      );
    }
  }
  
}
