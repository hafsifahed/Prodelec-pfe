import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';

@Component({
  selector: 'app-archive-cdc-modal',
  templateUrl: './archive-cdc-modal.component.html',
  styleUrls: ['./archive-cdc-modal.component.scss']
})
export class ArchiveCdcModalComponent {
  @Input() archiveId: number;
  @Output() onArchived = new EventEmitter<void>();

  constructor(
    public modalRef: BsModalRef,
    private cdcService: CdcServiceService
  ) {}

  confirmArchive(): void {
    if (this.archiveId !== null) {
      this.cdcService.archiver(this.archiveId).subscribe({
        next: () => {
          Swal.fire('Archivé!', 'Le cahier des charges a été archivé avec succès.', 'success');
          this.onArchived.emit();
          this.modalRef.hide();
        },
        error: (error) => {
          console.error('Error archiving cahier des charges', error);
          Swal.fire('Erreur', 'Erreur lors de l\'archivage', 'error');
          this.modalRef.hide();
        }
      });
    }
  }
}