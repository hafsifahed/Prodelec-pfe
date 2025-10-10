import { Component, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { CahierDesCharges, CdcFile } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';
import { AddCdCComponent } from '../modals/add-cd-c/add-cd-c.component';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { User } from 'src/app/core/models/auth.models';
import { environment } from 'src/environments/environment';
import { DeleteCdcModalComponent } from '../modals/delete-cdc-modal/delete-cdc-modal.component';
import { DetailsCdcModalComponent } from '../modals/details-cdc-modal/details-cdc-modal.component';
import { UploadFileModalComponent } from '../modals/upload-file-modal/upload-file-modal.component';
import { Action, Resource } from 'src/app/core/models/role.model';

@Component({
  selector: 'app-cdc-list-user',
  templateUrl: './cdc-list-user.component.html',
  styleUrls: ['./cdc-list-user.component.scss']
})
export class CDCListUserComponent {
  cahierDesCharges: CahierDesCharges[] = [];
  cahier?: CahierDesCharges;
  modalRef?: BsModalRef;

  searchTitle = '';
  filterYear = '';
  p = 1;
  itemsPerPage = 5;
  isAscending = true;
        Resource = Resource;
    Action = Action;

  user: User | null = null;

  @ViewChildren(CDCListUserComponent) headers!: QueryList<CDCListUserComponent>;
  @ViewChild('addCdcModal') addCdcModal!: TemplateRef<AddCdCComponent>;

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
          console.log('front cdc user',data)
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

  openDeleteModal(id: number): void {
  const initialState = {
    deleteId: id,
    user: this.user
  };
  
  this.modalRef = this.modalService.show(DeleteCdcModalComponent, { initialState });
  this.modalRef.content.onArchive.subscribe(() => {
    if (this.user) this.loadCDC(this.user);
  });
}

  

  openDetailsModal(id: number): void {
  this.cdcService.getById(id).subscribe(
    data => {
      const initialState = {
        cahier: data,
        user: this.user
      };
      
      this.modalRef = this.modalService.show(DetailsCdcModalComponent, { 
        initialState,
        class: 'modal-md'
      });
      
      this.modalRef.content.onFileDeleted.subscribe(() => {
        this.cdcService.getById(id).subscribe(updatedCdc => {
          this.cahier = updatedCdc;
          if (this.user) this.loadCDC(this.user);
        });
      });
      
      this.modalRef.content.onFileUploaded.subscribe(() => {
        this.openUploadModal(id);
      });
    }
  );
}


  openModal(content: any) {
    this.modalRef = this.modalService.show(content, { class: 'modal-md' });
  }

  openUploadModal(cdcId: number): void {
  const initialState = {
    cdcId: cdcId,
    user: this.user
  };
  
  this.modalRef = this.modalService.show(UploadFileModalComponent, { initialState });
  this.modalRef.content.onUpload.subscribe(() => {
    if (this.user) this.loadCDC(this.user);
    if (this.cahier?.id === cdcId) {
      this.cdcService.getById(cdcId).subscribe(updatedCdc => this.cahier = updatedCdc);
    }
  });
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
