import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup,  Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import Swal from 'sweetalert2';
import { CDCListUserComponent } from '../cdc-list-user/cdc-list-user.component';
import { UserModel } from 'src/app/core/models/user.models';
import { UsersService } from 'src/app/core/services/users.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { EmailService } from 'src/app/core/services/email.service';

@Component({
  selector: 'app-add-cd-c',
  templateUrl: './add-cd-c.component.html',
  styleUrls: ['./add-cd-c.component.scss']
})
export class AddCdCComponent implements OnInit {
  addForm: FormGroup;
  modalRef?: BsModalRef;
  selectedFile: File | null = null;
  user: UserModel | null = null;
  errorMessage: string;
  userEmail = localStorage.getItem('userMail') || '';

  constructor(private cdcService: CdcServiceService,private notificationsService:NotificationService, private cdcComp:CDCListUserComponent,private usersService : UsersService,private emailService:EmailService) {
    this.addForm = new FormGroup({
      titre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl(''),
      pieceJointe: new FormControl('')
    });
  }
ngOnInit(): void {
  if (this.userEmail) {
    this.fetchUser(this.userEmail);
    
  }
}

private createNotification(title: string, message: string): void {
  const newNotification = {
    id: 0,
    title: title,
    message: message,
    createdBy: this.user.email, // Replace with the actual creator's name
    read: false,
    userId: 0, // Replace with the actual user ID or retrieve it from the logged-in user
    workerId: 0,
    createdAt: '',
    updatedAt: ''
  };

  this.notificationsService.createNotificationForUser(newNotification, this.user.id).subscribe(
      () => {
        console.log('Notification created successfully.');
      },
      (error) => {
        console.error('Error creating notification', error);
      }
  );
}
  private fetchUser(email: string): void {
    this.usersService.getUserByEmail(email).subscribe(
        (data) => {
          this.user = data;
          console.log(this.user)
        },
        (error) => {
          console.error('Error fetching user data', error);
          this.errorMessage = 'Error fetching user data. Please try again later.';
        }
    );
  }
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }
  addF() {
    
    if (this.addForm.valid) {
      const cahierDesCharges: CahierDesCharges = {
        id: 0,
        titre: this.addForm.value.titre,
        description: this.addForm.value.description,
        pieceJointe: this.selectedFile ? this.selectedFile.name : '', // Vous devez définir le nom de fichier ici si vous utilisez selectedFile
        commentaire: '',
        archive: false,
        archiveU: false,
        etat: 'en_attente',
        dateCreation: new Date(),
        user: {
          id: this.user?.id,
          email: this.user?.email,
          firstName: this.user?.firstName,
          lastName: this.user?.lastName,
          password: this.user?.password,
          role: this.user?.role,
          userSessions: this.user?.userSessions,
          partner: this.user?.partner,
          createdAt: this.user?.createdAt,
          updatedAt: this.user?.updatedAt
      
        }
      };
      console.log(this.user)
      console.log(cahierDesCharges)
      this.cdcService.addCdc(cahierDesCharges).subscribe(
        (response) => {
      
          console.log('Cahier des charges ajouté avec succès', response);
          // Vous devrez probablement appeler saveCahierDesCharges ici pour gérer l'upload de la pièce jointe
          Swal.fire({
            title: 'Ajouté!',
            text: "Cahier des charges a été ajoutée avec succès.",
            icon: 'success'
          });
          this.cdcComp.modalRef?.hide();
          this.cdcComp.ngOnInit();
           // Réinitialiser le formulaire après l'ajout réussi
           this.sendmail(['contact@prodelecna.com','Fmrad@prodelecna.com','Tooling@prodelecna.com'],'Nouveau Cahier des charges', cahierDesCharges);
           this.createNotification('Nouvel Cahier des charges ajouté', 'Par: ' + this.userEmail );
          this.saveCahierDesCharges();
         
        },
        (error) => {
          console.error('Error adding cahier des charges', error);
          // Afficher un message d'erreur ou gérer l'erreur d'ajout du cahier des charges
        }
      );
    } else {
      alert('Veuillez remplir tous les champs correctement.');
    }
  }

  sendmail(to: string[], subject: string,  cdc : CahierDesCharges
  ) {
    const emailText = `
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 80%;
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #eeeeee;
      padding-bottom: 20px;
    }
    .header img {
      height: 50px;
    }
    .content {
      padding: 20px;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #666666;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img  src="https://www.prodelecna.com/wp-content/uploads/2021/12/logo-PRODELEC.png" class="attachment-large size-large" alt="logo PRODELEC">
    </div>
    <div class="content">
      <h1>Nouveau Cahier des charges ajouté</h1>
      <p><strong>Projet:</strong> ${cdc.titre}</p>
      <p><strong>Client:</strong> ${cdc.user.partner.name}</p>
      <p><strong>Email:</strong> ${cdc.user.email}</p>
    </div>
    <div class="footer">
      <p>Prodelec &copy; 2024</p>
    </div>
  </div>
</body>
</html>
  `;
    this.emailService.sendEmail(to,subject,emailText).subscribe(
      (response) => {
        console.log(response);
        console.log(cdc.user);
      },
      (error) => {
        console.error(error);
  
      }
    );
  }
  saveCahierDesCharges() {
    if (this.selectedFile) {
      this.cdcService.uploadFile(this.selectedFile).subscribe(
        (filename) => {

          console.log('Pièce jointe téléchargée avec succès', filename);
          console.log(this.selectedFile);
          // Vous pouvez sauvegarder à nouveau le cahier des charges si nécessaire
          this.addForm.reset();
        },
        (error) => {
          console.error('Error uploading file', error);
        }
      );
    }
  }
}