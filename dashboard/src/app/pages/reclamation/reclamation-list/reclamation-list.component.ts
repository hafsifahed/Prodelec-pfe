import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Reclamation } from 'src/app/core/models/reclamation';
import Swal from 'sweetalert2';
import { ReclamationService } from 'src/app/core/services/Reclamation/reclamation.service';
import { EmailService } from 'src/app/core/services/email.service';
import { UserModel } from 'src/app/core/models/user.models';
import { UsersService } from 'src/app/core/services/users.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-reclamation-list',
  templateUrl: './reclamation-list.component.html',
  styleUrls: ['./reclamation-list.component.scss']
})
export class ReclamationListComponent {
  reclamation: Reclamation[] = [];
  rec : Reclamation;
  filteredReclamations : Reclamation[] = [];
  modalRef?: BsModalRef;
  reclamationForm: FormGroup;
  selectedFile: File | null = null;
  rejectId : number; 
  p: number = 1; // Current page number
  itemsPerPage: number = 6;
  selectedYear: string = 'All';
  selectedType: string = 'All';
  searchQuery: string = '';
  isAscending : boolean = true;
  user: UserModel | null = null;
  errorMessage: string;
  userEmail = localStorage.getItem('userMail') || 'rh.process@example.com';

  constructor(
    private reclamationService: ReclamationService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private emailService: EmailService,
    private usersService : UsersService,
    private notificationsService : NotificationService
  ) {
    this.reclamationForm = this.fb.group({
      type_de_defaut: ['', Validators.required],
      description: ['', Validators.required],
      pieceJointe: [null]
    });
  }
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;

  private fetchUser(email: string): void {
    this.usersService.getUserByEmail(email).subscribe(
        (data) => {
          this.user = data;
          this.loadReclamation(data);
          console.log(this.user)
        },
        (error) => {
          console.error('Error fetching user data', error);
          this.errorMessage = 'Error fetching user data. Please try again later.';
        }
    );
  }
  openDetailsModal(id: number): void {
    this.reclamationService.getById(id).subscribe(
      (data) => {
        this.rec= data; // Stocker les détails du cahier dans this.cahier
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
     
      },
      (error) => {
        console.error('Error fetching cahier des charges details', error);
      }
    );
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

   /* this.notificationsService.createNotificationForUser(newNotification, this.user.id).subscribe(
        () => {
          console.log('Notification created successfully.');
        },
        (error) => {
          console.error('Error creating notification', error);
        }
    );*/
  }
  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredReclamations.sort((a, b) => {
      const dateA = new Date(a.dateDeCreation).getTime();
      const dateB = new Date(b.dateDeCreation).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }


  loadReclamation(user: UserModel): void {
    if (user.role === 'CLIENTADMIN') {
      this.reclamationService.getAllreclamation().subscribe(
        (data) => {
          // Filter the fetched reclamations by partner
          this.reclamation = data.filter(reclamation => reclamation.user.partner.id === user.partner.id && !reclamation.archiveU);
          this.applyFilter();
          console.log('Loaded and filtered reclamations for partner:', this.filteredReclamations); // Debug log
        },
        (error) => {
          console.error('Error fetching reclamations for partner', error);
        }
      );
    } else {
      this.reclamationService.getByIdUser(user.id).subscribe(
        (data) => {
          this.reclamation = data.filter(reclamation => !reclamation.archiveU); // Filter out archived reclamations
          this.applyFilter();
          console.log('Loaded and filtered reclamations:', this.filteredReclamations); // Debug log
        },
        (error) => {
          console.error('Error fetching user reclamations', error);
        }
      );
    }
  }


  onYearChange(): void {
    this.applyFilter();
  }

  onTypeChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredReclamations = this.reclamation;

    if (this.selectedYear !== 'All') {
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => {
        const year = new Date(reclamation.dateDeCreation).getFullYear().toString();
        return year === this.selectedYear;
      });
    }

    if (this.selectedType !== 'All') {
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => reclamation.type_de_defaut === this.selectedType);
    }

    if (this.searchQuery.trim() !== '') {
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => reclamation.user.email.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
  }

  getUniqueYears(): string[] {
    const years = this.reclamation.map(reclamation => new Date(reclamation.dateDeCreation).getFullYear().toString());
    return ['All', ...Array.from(new Set(years))];
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-md' });
  }

  openDeleteModal(id: number, template: TemplateRef<any>): void {
    this.rejectId = id;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }


  confirmDelete(): void {
    if (this.rejectId !== null) {
      this.reclamationService.archiverU(this.rejectId).subscribe(
        () => {
          Swal.fire({
            title: 'Supprimé!',
            text: "Le cahier des charges a été supprimé avec succès.",
            icon: 'success'
          })
     
          this.reclamation = this.reclamation.filter(reclamation => reclamation.id_Reclamation !== this.rejectId);
          this.rejectId = null;
               this.ngOnInit();
          this.modalRef?.hide();
        },
        error => {
          console.error('Error deleting cahier des charges', error);
          alert('Cahier des charges not deleted!');
          this.rejectId = null;
          this.modalRef?.hide();
        }
      );
    }
  }

  @ViewChild('deleteModal', { static: false }) deleteModal?: ModalDirective;

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  addReclamation() {
    if (this.reclamationForm.valid) {
      const newReclamation: Reclamation = {
        id_Reclamation: 0,
        type_de_defaut: this.reclamationForm.value.type_de_defaut,
        description: this.reclamationForm.value.description,
        pieceJointe: this.selectedFile ? this.selectedFile.name : '',
        reponse: '',
        archive: false,
        archiveU: false,
        dateDeCreation: new Date(),
        status: 'En cours',
        user:  {
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

      this.reclamationService.addreclamation(newReclamation).subscribe(
        (response) => {
       
          Swal.fire({
            title: 'Ajouté!',
            text: "La Réclamation a été ajoutée avec succès.",
            icon: 'success'
          });
         
          this.sendmail(['contact@prodelecna.com','Fmrad@prodelecna.com','Tooling@prodelecna.com'],'Nouvelle Réclamation', newReclamation);//email de responsable Reclamation Proelec
          this.saveReclamation();
          this.modalRef?.hide();
          this.reclamationForm.reset();
          this.createNotification('Nouvel réclamation ajouté', 'Par: ' + this.userEmail );
          this.ngOnInit();
        },
        (error) => {
          console.log(error)
          Swal.fire({
            title: 'Erreur!',
            text: "Une erreur s'est produite lors de l'ajout de la Réclamation.",
            icon: 'error'
          });
        }
      );
    } else {
      Swal.fire({
        title: 'Erreur de formulaire!',
        text: "Veuillez remplir tous les champs obligatoires.",
        icon: 'error'
      });
    }
  }
  sendmail(to: string[], subject: string,  reclamation : Reclamation
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
      <h1>Nouvelle Réclamation</h1>
      <p><strong>Probléme:</strong> ${reclamation.type_de_defaut}</p>
      <p><strong>Email:</strong> ${reclamation.user.email}</p>
      <p><strong>Client:</strong> ${reclamation.user.partner.name}</p>
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
        console.log(reclamation.user);
      },
      (error) => {
        console.error(error);
  
      }
    );
  }
  saveReclamation() {
    if (this.selectedFile) {
      this.reclamationService.uploadFile(this.selectedFile).subscribe(
        (filename) => {
          console.log('Pièce jointe téléchargée avec succès', filename);
          console.log(this.selectedFile);
        },
        (error) => {
          console.error('Error uploading file', error);
        }
      );
    }
  }
}
