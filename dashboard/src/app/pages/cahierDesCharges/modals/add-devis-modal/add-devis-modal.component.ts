import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import Swal from 'sweetalert2';
import { DevisService } from 'src/app/core/services/Devis/devis.service';

@Component({
  selector: 'app-add-devis-modal',
  templateUrl: './add-devis-modal.component.html',
  styleUrls: ['./add-devis-modal.component.scss']
})
export class AddDevisModalComponent {
  @Input() cahier: CahierDesCharges;
  @Output() onDevisAdded = new EventEmitter<void>();
  
  selectedFile: File | null = null;
  numdevis: string = '';

  constructor(
    public modalRef: BsModalRef,
    private devisService: DevisService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  submitDevis(): void {
    if (this.cahier && this.selectedFile && this.numdevis.trim()) {
      this.devisService.uploadFile(this.selectedFile).subscribe({
        next: (uploadResponse: any) => {
          const filename = uploadResponse.filename || uploadResponse;
          this.devisService.saveDevis(this.cahier.id!, filename, this.numdevis).subscribe({
            next: () => {
              Swal.fire('Ajouté!', 'Le devis a été ajouté avec succès.', 'success');
              this.onDevisAdded.emit();
              this.modalRef.hide();
            },
            error: (error) => {
              console.error('Erreur lors de l\'ajout du devis:', error);
              Swal.fire('Erreur', 'Erreur lors de l\'ajout du devis', 'error');
            }
          });
        },
        error: (error) => {
          console.error('Erreur lors de l\'upload du fichier:', error);
          Swal.fire('Erreur', 'Erreur lors de l\'upload du fichier', 'error');
        }
      });
    } else {
      Swal.fire('Erreur', 'Veuillez compléter tous les champs requis.', 'warning');
    }
  }
}