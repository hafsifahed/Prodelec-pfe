import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { DevisService } from 'src/app/core/services/Devis/devis.service';

@Component({
  selector: 'app-refuse-devis-modal',
  templateUrl: './refuse-devis-modal.component.html',
  styleUrls: ['./refuse-devis-modal.component.scss']
})
export class RefuseDevisModalComponent {
  @Input() refuseId: number;
  @Output() onRefused = new EventEmitter<void>();
  
  commentaire: string = '';

  constructor(
    public modalRef: BsModalRef,
    private devisService: DevisService
  ) {}

  confirmRefuse(): void {
    if (this.refuseId !== null && this.commentaire.trim()) {
      this.devisService.rejectdevis(this.refuseId, this.commentaire).subscribe(
        () => {
          Swal.fire('Succès', 'Le devis a été refusé.', 'success');
          this.onRefused.emit();
          this.modalRef.hide();
        },
        (error) => {
          console.error('Error rejecting devis', error);
          Swal.fire('Erreur', 'Impossible de refuser le devis', 'error');
          this.modalRef.hide();
        }
      );
    }
  }
}