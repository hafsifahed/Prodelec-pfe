import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { DevisService } from 'src/app/core/services/Devis/devis.service';

@Component({
  selector: 'app-negociation-devis-modal',
  templateUrl: './negociation-devis-modal.component.html',
  styleUrls: ['./negociation-devis-modal.component.scss']
})
export class NegociationDevisModalComponent {
  @Input() negociationId: number;
  @Output() onNegociationStarted = new EventEmitter<void>();
  
  commentaire: string = '';

  constructor(
    public modalRef: BsModalRef,
    private devisService: DevisService
  ) {}

  confirmNegociation(): void {
    if (this.negociationId !== null) {
      this.devisService.negocierDevis(this.negociationId, this.commentaire).subscribe({
        next: () => {
          Swal.fire('Mise à jour', 'Le devis est maintenant en négociation.', 'success');
          this.onNegociationStarted.emit();
          this.modalRef.hide();
        },
        error: (error) => {
          console.error('Erreur lors du démarrage de la négociation', error);
          Swal.fire('Erreur', 'Impossible de commencer la négociation.', 'error');
        }
      });
    }
  }
}