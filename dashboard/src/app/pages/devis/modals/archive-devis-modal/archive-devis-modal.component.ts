import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { DevisService } from 'src/app/core/services/Devis/devis.service';

@Component({
  selector: 'app-archive-devis-modal',
  templateUrl: './archive-devis-modal.component.html',
  styleUrls: ['./archive-devis-modal.component.scss']
})
export class ArchiveDevisModalComponent {
  @Input() archiveId: number;
  @Output() onArchived = new EventEmitter<void>();

  constructor(
    public modalRef: BsModalRef,
    private devisService: DevisService
  ) {}

  confirmArchive(): void {
    if (this.archiveId !== null) {
      this.devisService.archiverU(this.archiveId).subscribe(
        () => {
          Swal.fire('Archivé!', 'Le devis a été archivé avec succès.', 'success');
          this.onArchived.emit();
          this.modalRef.hide();
        },
        error => {
          console.error('Error archiving devis', error);
          Swal.fire('Erreur', 'Impossible d\'archiver le devis', 'error');
          this.modalRef.hide();
        }
      );
    }
  }
}