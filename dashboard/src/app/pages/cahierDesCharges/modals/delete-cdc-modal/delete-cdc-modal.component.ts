import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';

@Component({
  selector: 'app-delete-cdc-modal',
  templateUrl: './delete-cdc-modal.component.html',
  styleUrls: ['./delete-cdc-modal.component.scss']
})
export class DeleteCdcModalComponent {
  @Input() deleteId: number;
  @Input() user: any;
  @Output() onArchive = new EventEmitter<void>();

  constructor(
    public modalRef: BsModalRef,
    private cdcService: CdcServiceService
  ) {}

  confirmDelete(): void {
    this.cdcService.archiverU(this.deleteId).subscribe(
      () => {
        Swal.fire('Archivé!', 'Le cahier des charges a été archivé avec succès.', 'success');
        this.onArchive.emit();
        this.modalRef.hide();
      },
      error => {
        console.error('Error deleting cahier des charges', error);
        Swal.fire('Erreur', 'L\'archivage a échoué', 'error');
        this.modalRef.hide();
      }
    );
  }
}