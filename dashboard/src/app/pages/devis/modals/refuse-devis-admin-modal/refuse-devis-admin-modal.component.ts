import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { DevisService } from 'src/app/core/services/Devis/devis.service';

@Component({
  selector: 'app-refuse-devis-admin-modal',
  templateUrl: './refuse-devis-admin-modal.component.html',
  styleUrls: ['./refuse-devis-admin-modal.component.scss']
})
export class RefuseDevisAdminModalComponent {
  @Input() refuseId: number;
  @Output() onRefused = new EventEmitter<void>();
  
  commentaireRefus: string = '';

  constructor(
    public modalRef: BsModalRef,
    private devisService: DevisService
  ) {}

  confirmRefuse(): void {
    if (this.refuseId !== null && this.commentaireRefus.trim()) {
      this.devisService.rejectdevis(this.refuseId, this.commentaireRefus).subscribe(
        () => {
          Swal.fire('Succès!', 'Le devis a été refusé.', 'success');
          this.onRefused.emit();
          this.modalRef.hide();
        },
        (error) => {
          console.error('Erreur lors du refus du devis', error);
          Swal.fire('Erreur!', 'Une erreur est survenue lors du refus', 'error');
          this.modalRef.hide();
        }
      );
    }
  }
}