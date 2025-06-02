import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Reclamation } from 'src/app/core/models/reclamation';
import Swal from 'sweetalert2';
import { ReclamationService } from 'src/app/core/services/Reclamation/reclamation.service';
import { EmailService } from 'src/app/core/services/email.service';
import { UsersService } from 'src/app/core/services/users.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';

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
  user: User | null = null;
  errorMessage: string;

  constructor(
    private reclamationService: ReclamationService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private emailService: EmailService,
    private userStateService: UserStateService
  ) {
    this.reclamationForm = this.fb.group({
      type_de_defaut: ['', Validators.required],
      description: ['', Validators.required],
      PieceJointe: [null]
    });
  }
  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;

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
    this.userStateService.user$.subscribe(user => {
      this.user = user;
      this.loadReclamation(user);
    });
  }

  sortDevisByDate(): void {
    this.isAscending = !this.isAscending;
    this.filteredReclamations.sort((a, b) => {
      const dateA = new Date(a.dateDeCreation).getTime();
      const dateB = new Date(b.dateDeCreation).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }


  loadReclamation(user: User): void {
    if (user.role.name === 'CLIENTADMIN') {
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
     
          this.reclamation = this.reclamation.filter(reclamation => reclamation.id_reclamation !== this.rejectId);
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
    // Si fichier sélectionné, uploader d'abord
    if (this.selectedFile) {
      this.reclamationService.uploadFile(this.selectedFile).subscribe(
        (uploadResult) => {
          // uploadResult.filename contient le nom réel sauvegardé côté backend
          this.createReclamationWithFile(uploadResult.filename);
        },
        (error) => {
          console.error('Erreur upload fichier', error);
          Swal.fire('Erreur', 'Erreur lors de l\'upload du fichier.', 'error');
        }
      );
    } else {
      // Pas de pièce jointe
      this.createReclamationWithFile('');
    }
  } else {
    Swal.fire({
      title: 'Erreur de formulaire!',
      text: "Veuillez remplir tous les champs obligatoires.",
      icon: 'error'
    });
  }
}

createReclamationWithFile(pieceJointe: string) {
  const newReclamation: Reclamation = {
    id_reclamation: 0,
    type_de_defaut: this.reclamationForm.value.type_de_defaut,
    description: this.reclamationForm.value.description,
    PieceJointe: pieceJointe,
    reponse: '',
    archive: false,
    archiveU: false,
    dateDeCreation: new Date(),
    status: 'En cours',
    user: {
      id: this.user?.id,
      email: this.user?.email,
      username: this.user?.username,
      accountStatus: this.user?.accountStatus,
      firstName: this.user?.firstName,
      lastName: this.user?.lastName,
      role: this.user?.role,
      partner: this.user?.partner,
      createdAt: this.user?.createdAt,
      updatedAt: this.user?.updatedAt
    }
  };

  this.reclamationService.addreclamation(newReclamation).subscribe(
    (response) => {
      Swal.fire('Ajouté!', "La Réclamation a été ajoutée avec succès.", 'success');
      this.sendmail(['hafsifahed98@gmail.com', 'hafsifahed019@gmail.com'], 'Nouvelle Réclamation', newReclamation);
      this.modalRef?.hide();
      this.reclamationForm.reset();
      this.ngOnInit();
    },
    (error) => {
      Swal.fire('Erreur!', "Une erreur s'est produite lors de l'ajout de la Réclamation.", 'error');
    }
  );
}



  sendmail(to: string[], subject: string,  reclamation : Reclamation) {
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
