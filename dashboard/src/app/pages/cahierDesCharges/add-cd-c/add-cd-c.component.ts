import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';
import { CDCListUserComponent } from '../cdc-list-user/cdc-list-user.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import { EmailService } from 'src/app/core/services/email.service';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-add-cd-c',
  templateUrl: './add-cd-c.component.html',
  styleUrls: ['./add-cd-c.component.scss']
})
export class AddCdCComponent implements OnInit {
  addForm: FormGroup;
  modalRef?: BsModalRef;
  selectedFiles: File[] = [];
  user: User | null = null;
  fileInputTouched = false;

  constructor(
    private cdcService: CdcServiceService,
    private notificationsService: NotificationService,
    private cdcComp: CDCListUserComponent,
    private emailService: EmailService,
    private userStateService: UserStateService
  ) {
    this.addForm = new FormGroup({
      titre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
      this.user = user;
    });
  }

  onFilesSelected(event: Event): void {
    this.fileInputTouched = true;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
    } else {
      this.selectedFiles = [];
    }
  }

  addF(): void {
    if (!this.user) {
      Swal.fire('Erreur', 'Utilisateur non connecté', 'error');
      return;
    }

    if (this.addForm.invalid || (this.isDescriptionEmpty() && this.selectedFiles.length === 0)) {
      Swal.fire('Erreur', 'Veuillez remplir le titre et fournir une description ou au moins un fichier.', 'error');
      return;
    }

    if (this.selectedFiles.length > 0) {
      // Upload multiple fichiers
      this.cdcService.uploadMultipleFiles(this.selectedFiles, this.user.username).subscribe({
        next: (uploadResponses) => {
          // Extraire les noms de fichiers uploadés
          const fileNames: string[] = uploadResponses.map(f => f.filename);
          // Créer le Cahier des charges avec la liste des noms de fichiers
          this.submitCdc(fileNames);
        },
        error: () => {
          Swal.fire('Erreur', 'Erreur lors du téléchargement des fichiers', 'error');
        }
      });
    } else {
      // Aucun fichier sélectionné : créer avec description seulement
      this.submitCdc([]);
    }
  }

  private submitCdc(uploadedFileNames: string[]): void {
  if (!this.user) {
    Swal.fire('Erreur', 'Utilisateur non connecté', 'error');
    return;
  }

  const payload: Partial<CahierDesCharges> & { fileNames?: string[] } = {
    titre: this.addForm.value.titre,
    description: this.addForm.value.description || '',
    commentaire: '',
    archive: false,
    archiveU: false,
    etat: 'en_attente',
    user: this.user,  // objet partiel user avec id
    fileNames: uploadedFileNames  // tableau des noms de fichiers
  };

  this.cdcService.addCdc(payload).subscribe({
    next: () => {
      Swal.fire('Succès', 'Cahier des charges ajouté avec succès.', 'success');
      this.addForm.reset();
      this.selectedFiles = [];
      this.fileInputTouched = false;
      this.modalRef?.hide();
      this.cdcComp.ngOnInit();
    },
    error: (error) => {
      console.error('Erreur lors de l\'ajout', error);
      const msg = 
        error.error?.message || 
        error.message || 
        'Erreur lors de l\'ajout du cahier des charges';
      Swal.fire('Erreur', msg, 'error');
    }
  });
}


  isDescriptionEmpty(): boolean {
    const desc = this.addForm.get('description')?.value;
    return !desc || desc.trim() === '';
  }

  // Optionnel : méthode d’envoi d’email à garder ou adapter
  sendmail(to: string[], subject: string, cdc: CahierDesCharges): void {
    // votre code d’email ici
  }
}
