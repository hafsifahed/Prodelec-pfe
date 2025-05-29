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
  selectedFile: File | null = null;
  user: User | null = null;
  errorMessage: string = '';
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
      pieceJointe: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
      this.user = user;
    });
  }

  onFileSelected(event: any): void {
  this.fileInputTouched = true;
  if (event.target.files && event.target.files.length > 0) {
    this.selectedFile = event.target.files[0];
  } else {
    this.selectedFile = null;
  }
}

 addF() {
  if (!this.user) {
    Swal.fire('Erreur', 'Utilisateur non connecté', 'error');
    return;
  }

  if (this.addForm.invalid) {
    Swal.fire('Erreur', 'Veuillez remplir tous les champs correctement.', 'error');
    return;
  }

  if (this.selectedFile) {
    this.cdcService.uploadFile(this.selectedFile,this.user.username).subscribe({
      next: (response) => {
        this.submitCdc(response.filename);
      },
      error: () => {
        Swal.fire('Erreur', 'Erreur lors du téléchargement de la pièce jointe', 'error');
      }
    });
  } else {
    this.submitCdc('');
  }
}

private submitCdc(pieceJointeFilename: string) {
  const cahierDesCharges = {
    titre: this.addForm.value.titre,
    description: this.addForm.value.description,
    pieceJointe: pieceJointeFilename,
    commentaire: '',
    archive: false,
    archiveU: false,
    etat: 'en_attente',
    userId: this.user!.id
  };

 this.cdcService.addCdc(cahierDesCharges).subscribe({
  next: () => {
    Swal.fire('Succès', 'Cahier des charges ajouté avec succès.', 'success');
    this.addForm.reset();
    this.selectedFile = null;

    // Fermer la modale
    this.modalRef?.hide();

    // Si vous devez rafraîchir la liste ou autre, vous pouvez aussi appeler ici
    this.cdcComp.ngOnInit();
  },
  error: (error) => {
    console.error('Erreur lors de l\'ajout', error);
    Swal.fire('Erreur', error.error?.message || 'Erreur lors de l\'ajout du cahier des charges', 'error');
  }
});

}



  private createNotification(title: string, message: string): void {
    if (!this.user) return;
    const newNotification = {
      id: 0,
      title,
      message,
      createdBy: this.user.email ?? '',
      read: false,
      userId: this.user.id ?? 0,
      workerId: 0,
      createdAt: '',
      updatedAt: ''
    };

    /*this.notificationsService.createNotificationForUser(newNotification, this.user.id).subscribe(
      () => console.log('Notification created successfully.'),
      (error) => console.error('Error creating notification', error)
    );*/
  }
isDescriptionEmpty(): boolean {
  const desc = this.addForm.get('description')?.value;
  return !desc || desc.trim() === '';
}


  sendmail(to: string[], subject: string, cdc: CahierDesCharges): void {
    const emailText = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { width: 80%; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .header img { height: 50px; }
          .content { padding: 20px; }
          .footer { text-align: center; font-size: 14px; color: #666; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://www.prodelecna.com/wp-content/uploads/2021/12/logo-PRODELEC.png" alt="logo PRODELEC" />
          </div>
          <div class="content">
            <h1>Nouveau Cahier des charges ajouté</h1>
            <p><strong>Projet:</strong> ${cdc.titre}</p>
            <p><strong>Client:</strong> ${cdc.user?.partner?.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${cdc.user?.email}</p>
          </div>
          <div class="footer">
            <p>Prodelec &copy; 2024</p>
          </div>
        </div>
      </body>
      </html>
    `;
    this.emailService.sendEmail(to, subject, emailText).subscribe({
      next: (response) => console.log('Email envoyé', response),
      error: (error) => console.error('Erreur envoi email', error)
    });
  }
}
