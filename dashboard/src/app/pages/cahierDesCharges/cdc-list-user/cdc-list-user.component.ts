import { Component, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { CahierDesCharges, CdcFile } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';
import { AddCdCComponent } from '../add-cd-c/add-cd-c.component';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { User } from 'src/app/core/models/auth.models';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cdc-list-user',
  templateUrl: './cdc-list-user.component.html',
  styleUrls: ['./cdc-list-user.component.scss']
})
export class CDCListUserComponent {
  cahierDesCharges: CahierDesCharges[] = [];
  cahier?: CahierDesCharges;
  modalRef?: BsModalRef;

  deleteId: number | null = null;
  selectedCdcId: number | null = null;
  selectedFiles: File[] = [];

  searchTitle = '';
  filterYear = '';
  p = 1;
  itemsPerPage = 5;
  isAscending = true;

  user: User | null = null;

  @ViewChildren(CDCListUserComponent) headers!: QueryList<CDCListUserComponent>;
  @ViewChild('addCdcModal') addCdcModal!: TemplateRef<AddCdCComponent>;
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModal?: TemplateRef<any>;
  @ViewChild('uploadModal') uploadModal?: TemplateRef<any>;

  constructor(
    private cdcService: CdcServiceService,
    private modalService: BsModalService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadCDC(user);
      }
    });
  }

  loadCDC(user: User): void {
    if (user.role.name === 'CLIENTADMIN') {
      this.cdcService.getAllCdc().subscribe(
        data => {
          this.cahierDesCharges = data.filter(
            cdc => cdc.user.partner?.id === user.partner?.id && !cdc.archiveU
          );
        },
        error => console.error('Error fetching all CDCs for partner', error),
      );
    } else {
      this.cdcService.getByIdUser(user.id).subscribe(
        data => {
          this.cahierDesCharges = data.filter(cdc => !cdc.archiveU);
        },
        error => console.error('Error fetching user CDCs', error),
      );
    }
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.cahierDesCharges.sort((a, b) => {
      const dateA = new Date(a.createdAt ?? '').getTime();
      const dateB = new Date(b.createdAt ?? '').getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  getNonArchivedCahiers(): CahierDesCharges[] {
    if (!this.cahierDesCharges || !this.user) {
      return [];
    }
    return this.cahierDesCharges.filter(cdc =>
      cdc.user.partner?.name === this.user?.partner?.name &&
      !cdc.archiveU &&
      (!this.searchTitle || cdc.titre.toLowerCase().includes(this.searchTitle.toLowerCase())) &&
      (!this.filterYear || new Date(cdc.createdAt ?? '').getFullYear().toString() === this.filterYear)
    );
  }

  getAvailableYears(): string[] {
    if (!this.cahierDesCharges || this.cahierDesCharges.length === 0) {
      return [];
    }
    const years = this.cahierDesCharges
      .map(cdc => new Date(cdc.createdAt ?? '').getFullYear().toString());
    return Array.from(new Set(years));
  }

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.deleteId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirmDelete(): void {
    if (this.deleteId !== null) {
      this.cdcService.archiverU(this.deleteId).subscribe(
        () => {
          Swal.fire('Archivé!', 'Le cahier des charges a été archivé avec succès.', 'success');
          if (this.user) this.loadCDC(this.user);
          this.modalRef?.hide();
        },
        error => {
          console.error('Error deleting cahier des charges', error);
          Swal.fire('Erreur', 'L\'archivage a échoué', 'error');
          this.modalRef?.hide();
        }
      );
    }
  }

  openDetailsModal(id: number): void {
    this.cdcService.getById(id).subscribe(
      data => {
        this.cahier = data;
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
      },
      error => console.error('Error fetching cahier des charges details', error)
    );
  }

  openModal(content: any) {
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
  }

  openUploadModal(cdcId: number): void {
    this.selectedCdcId = cdcId;
    this.selectedFiles = [];
    this.openModal(this.uploadModal);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  uploadFiles() {
    if (this.selectedFiles.length > 0 && this.selectedCdcId && this.user) {
      this.cdcService.uploadMultipleFiles(this.selectedFiles, this.user.username, this.selectedCdcId)
        .subscribe({
          next: () => {
            Swal.fire('Succès', 'Fichiers uploadés avec succès', 'success');
            this.selectedFiles = [];
            this.modalRef?.hide();
            if (this.user) this.loadCDC(this.user);
            if (this.cahier?.id === this.selectedCdcId) {
              this.cdcService.getById(this.selectedCdcId).subscribe(updatedCdc => this.cahier = updatedCdc);
            }
          },
          error: err => {
            console.error(err);
            Swal.fire('Erreur', 'Échec de l\'upload des fichiers', 'error');
          }
        });
    }
  }

  deleteFile(fileId: number) {
    // À implémenter si vous avez une API pour supprimer individuellement un fichier
  }

  handleCahierDesChargesAdded() {
    Swal.fire('Ajouté!', 'Le cahier des charges a été ajouté avec succès.', 'success')
      .then(() => {
        this.modalRef?.hide();
        if (this.user) this.loadCDC(this.user);
      });
  }

  // Utilitaire : construire lien téléchargement pour fichier
  getDownloadLink(fileName: string): string {
    if (!this.user) return '';
    return `${environment.baseUrl}/cdc/download/${encodeURIComponent(fileName)}?username=${encodeURIComponent(this.user.username)}`;
  }
}
