import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { DevisService } from 'src/app/core/services/Devis/devis.service';

@Component({
  selector: 'app-archive-devis-admin-modal',
  templateUrl: './archive-devis-admin-modal.component.html',
  styleUrls: ['./archive-devis-admin-modal.component.scss']
})
export class ArchiveDevisAdminModalComponent {
  @Input() archiveId: number;
  @Output() onArchived = new EventEmitter<void>();

  constructor(
    public modalRef: BsModalRef,
    private devisService: DevisService
  ) {}

  confirmArchive(): void {
    this.devisService.archiver(this.archiveId).subscribe(
      () => {
        Swal.fire({
          title: 'Archivé!',
          text: "Le devis a été archivé avec succès.",
          icon: 'success'
        });
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