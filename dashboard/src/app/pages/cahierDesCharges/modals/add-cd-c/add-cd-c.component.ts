import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CahierDesCharges, EtatCahier } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';
import { CDCListUserComponent } from '../../cdc-list-user/cdc-list-user.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import { EmailService } from 'src/app/core/services/email.service';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { SettingService } from 'src/app/core/services/setting.service'; // Ajout du service settings

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
  settings: any; // Pour stocker les paramètres

  constructor(
    private cdcService: CdcServiceService,
    private notificationsService: NotificationService,
    private cdcComp: CDCListUserComponent,
    private emailService: EmailService,
    private userStateService: UserStateService,
    private settingService: SettingService // Injection du service settings
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
    this.loadSettings(); // Charger les paramètres
  }

  loadSettings(): void {
    this.settingService.getSettings().subscribe(
      (settings) => {
        this.settings = settings;
        console.log('Settings loaded:', settings);
      },
      (error) => {
        console.error('Error loading settings:', error);
        // Fallback vers les emails par défaut en cas d'erreur
        this.settings = { cahierDesChargesEmails: ['hafsifahed98@gmail.com', 'hafsifahed019@gmail.com'] };
      }
    );
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
      etat: EtatCahier.EnAttente,
      user: this.user,
      fileNames: uploadedFileNames
    };

    this.cdcService.addCdc(payload).subscribe({
      next: (response) => {
        Swal.fire('Succès', 'Cahier des charges ajouté avec succès.', 'success');
        
        // Envoyer l'email après l'ajout réussi
        this.sendCdcEmail(response, uploadedFileNames);
        
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

  // Méthode pour envoyer l'email de cahier des charges
  sendCdcEmail(cdc: CahierDesCharges, fileNames: string[]): void {
    const emailData = {
      titre: cdc.titre,
      description: cdc.description,
      email: this.user?.email,
      partenaire: this.user?.partner?.name,
      client: this.user?.username,
      dateCreation: new Date().toLocaleDateString('fr-FR'),
      fichiers: fileNames.length > 0 ? fileNames.join(', ') : 'Aucun fichier joint',
      etat: cdc.etat
    };

    // Utiliser les emails des settings ou une liste par défaut
    const recipientEmails = this.settings?.cahierDesChargesEmails || ['hafsifahed98@gmail.com', 'hafsifahed019@gmail.com'];
    
    this.sendmail(recipientEmails, 'Nouveau Cahier des Charges', emailData);
  }

  // Méthode d'envoi d'email
  sendmail(to: string[], subject: string, data: any): void {
    const emailText = `
<div>
  <h2>Nouveau Cahier des Charges</h2>
  <p><strong>Titre:</strong> ${data.titre}</p>
  <p><strong>Description:</strong> ${data.description}</p>
  <p><strong>Email du client:</strong> ${data.email}</p>
  <p><strong>Partenaire:</strong> ${data.partenaire}</p>
  <p><strong>Client:</strong> ${data.client}</p>
  <p><strong>Date de création:</strong> ${data.dateCreation}</p>
  <p><strong>Fichiers joints:</strong> ${data.fichiers}</p>
  <p><strong>État:</strong> ${data.etat}</p>
</div>`;
    
    this.emailService.sendEmail(to, subject, emailText).subscribe(
      (response) => {
        console.log('Email de cahier des charges envoyé avec succès:', response);
      },
      (error) => {
        console.error('Erreur envoi email de cahier des charges:', error);
      }
    );
  }

  isDescriptionEmpty(): boolean {
    const desc = this.addForm.get('description')?.value;
    return !desc || desc.trim() === '';
  }
}