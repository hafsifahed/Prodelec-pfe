import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';

@Component({
  selector: 'app-incomplete-cdc-modal',
  templateUrl: './incomplete-cdc-modal.component.html',
  styleUrls: ['./incomplete-cdc-modal.component.scss']
})
export class IncompleteCdcModalComponent {
  @Input() incompleteId: number;
  @Output() onMarkedIncomplete = new EventEmitter<void>();
  
  commentaire: string = '';

  constructor(
    public modalRef: BsModalRef,
    private cdcService: CdcServiceService
  ) {}

  confirmMarkAsIncomplete(): void {
    if (this.incompleteId !== null && this.commentaire.trim()) {
      this.cdcService.markAsIncomplete(this.incompleteId, this.commentaire).subscribe({
        next: () => {
          Swal.fire('Mis à jour', 'Le cahier des charges a été marqué comme "À compléter".', 'success');
          this.onMarkedIncomplete.emit();
          this.modalRef.hide();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          Swal.fire('Erreur', 'Erreur lors de la mise à jour du cahier des charges.', 'error');
          this.modalRef.hide();
        }
      });
    } else {
      Swal.fire('Attention', 'Veuillez saisir un commentaire valide.', 'warning');
    }
  }
}