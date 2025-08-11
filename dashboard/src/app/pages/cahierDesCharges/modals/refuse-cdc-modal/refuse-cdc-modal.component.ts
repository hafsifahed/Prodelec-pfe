import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';

@Component({
  selector: 'app-refuse-cdc-modal',
  templateUrl: './refuse-cdc-modal.component.html',
  styleUrls: ['./refuse-cdc-modal.component.scss']
})
export class RefuseCdcModalComponent {
  @Input() rejectId: number;
  @Output() onRefused = new EventEmitter<void>();
  
  commentaire: string = '';

  constructor(
    public modalRef: BsModalRef,
    private cdcService: CdcServiceService
  ) {}

  confirmRefuse(): void {
    if (this.rejectId !== null && this.commentaire.trim()) {
      this.cdcService.rejectCdc(this.rejectId, this.commentaire).subscribe({
        next: () => {
          Swal.fire('Refusé', 'Cahier des charges refusé avec succès', 'success');
          this.onRefused.emit();
          this.modalRef.hide();
        },
        error: (error) => {
          console.error('Error rejecting cahier des charges', error);
          Swal.fire('Erreur', 'Erreur lors du refus', 'error');
          this.modalRef.hide();
        }
      });
    } else {
      Swal.fire('Attention', 'Veuillez saisir un commentaire valide', 'warning');
    }
  }
}