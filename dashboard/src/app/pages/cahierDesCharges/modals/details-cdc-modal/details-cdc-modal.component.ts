import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CahierDesCharges, CdcFile } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-details-cdc-modal',
  templateUrl: './details-cdc-modal.component.html',
  styleUrls: ['./details-cdc-modal.component.scss']
})
export class DetailsCdcModalComponent {
  @Input() cahier: CahierDesCharges;
  @Input() user: any;
  @Output() onFileDeleted = new EventEmitter<void>();
  @Output() onFileUploaded = new EventEmitter<void>();

  constructor(
    public modalRef: BsModalRef,
    private cdcService: CdcServiceService
  ) {}

  getDownloadLink(fileName: string): string {
    return `${environment.baseUrl}/cdc/download/${encodeURIComponent(fileName)}?username=${encodeURIComponent(this.user.username)}`;
  }

  deleteFile(fileId: number): void {
    Swal.fire({
      title: 'Confirmer la suppression',
      text: 'Voulez-vous vraiment supprimer ce fichier ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then(result => {
      if (result.isConfirmed) {
        this.cdcService.deleteFile(fileId).subscribe({
          next: () => {
            Swal.fire('Supprimé!', 'Le fichier a été supprimé.', 'success');
            this.onFileDeleted.emit();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression fichier', err);
            Swal.fire('Erreur', 'Impossible de supprimer le fichier.', 'error');
          }
        });
      }
    });
  }

  openUploadModal() {
    this.modalRef.hide();
    this.onFileUploaded.emit();
  }
}