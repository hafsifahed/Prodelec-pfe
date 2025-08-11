import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Devis, EtatDevis } from 'src/app/core/models/Devis/devis';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpEventType } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-details-devis-admin-modal',
  templateUrl: './details-devis-admin-modal.component.html',
  styleUrls: ['./details-devis-admin-modal.component.scss']
})
export class DetailsDevisAdminModalComponent {
  @Input() devis: Devis;
  @Output() onDevisUpdated = new EventEmitter<void>();
  @Output() onAccept = new EventEmitter<number>();
  @Output() onRefuse = new EventEmitter<number>();
  
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  EtatDevis = EtatDevis;

  constructor(
    public modalRef: BsModalRef,
    private devisService: DevisService,
        private http: HttpClient
  ) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
  }

  uploadNewPieceJointe(): void {
  if (!this.selectedFile || !this.devis) {
    return;
  }

  this.uploadProgress = 0;
  
  // Créer un FormData pour l'envoi du fichier
  const formData = new FormData();
  formData.append('file', this.selectedFile, this.selectedFile.name);

  // Utiliser HttpClient pour l'upload
  this.http.post(`${environment.baseUrl}/devis/upload`, formData, {
    reportProgress: true,
    observe: 'events'
  }).subscribe(
    (event: any) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round(100 * event.loaded / event.total);
      } else if (event.type === HttpEventType.Response) {
        const fileName = event.body.filename;

        this.devisService.updateDevisPieceJointe(this.devis.id, fileName).subscribe(
          (updatedDevis) => {
            Swal.fire('Succès!', 'Le devis a été mis à jour avec le nouveau fichier.', 'success');
            this.devis.pieceJointe = fileName;
            this.selectedFile = null;
            this.uploadProgress = null;
            this.onDevisUpdated.emit();
          },
          (error) => {
            console.error('Erreur lors de la mise à jour du devis', error);
            Swal.fire('Erreur!', 'Impossible de mettre à jour le devis', 'error');
            this.uploadProgress = null;
          }
        );
      }
    },
    (error) => {
      console.error('Erreur lors de l\'upload du fichier', error);
      Swal.fire('Erreur!', 'Une erreur est survenue lors de l\'envoi du fichier', 'error');
      this.uploadProgress = null;
    }
  );
}

  telechargerPieceJointe(fileName: string): void {
    this.devisService.downloadFile(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error downloading file', error);
        if (error.status === 404) {
          Swal.fire('Fichier introuvable', `Le fichier ${fileName} n'existe pas sur le serveur.`, 'error');
        } else {
          Swal.fire('Erreur', 'Une erreur est survenue lors du téléchargement', 'error');
        }
      }
    });
  }

  acceptDevis(): void {
    this.onAccept.emit(this.devis.id);
  }

  refuseDevis(): void {
    this.onRefuse.emit(this.devis.id);
  }
}