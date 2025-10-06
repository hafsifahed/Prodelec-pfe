import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Reclamation } from 'src/app/core/models/reclamation';
import Swal from 'sweetalert2';
import { ReclamationService } from 'src/app/core/services/Reclamation/reclamation.service';
import { EmailService } from 'src/app/core/services/email.service';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { SettingService } from 'src/app/core/services/setting.service';

@Component({
  selector: 'app-reclamation-list',
  templateUrl: './reclamation-list.component.html',
  styleUrls: ['./reclamation-list.component.scss']
})
export class ReclamationListComponent {
  reclamation: Reclamation[] = [];
  rec: Reclamation;
  filteredReclamations: Reclamation[] = [];
  modalRef?: BsModalRef;
  reclamationForm: FormGroup;
  selectedFile: File | null = null;
  rejectId: number; 
  p: number = 1;
  itemsPerPage: number = 6;
  selectedYear: string = 'All';
  selectedType: string = 'All';
  searchQuery: string = '';
  isAscending: boolean = true;
  user: User | null = null;
  errorMessage: string;
  settings: any;

  constructor(
    private reclamationService: ReclamationService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private emailService: EmailService,
    private userStateService: UserStateService,
    private settingService: SettingService
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
        this.rec = data;
        this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-md' });
      },
      (error) => {
        console.error('Error fetching reclamation details', error);
        Swal.fire('Erreur', 'Impossible de charger les détails de la réclamation', 'error');
      }
    );
  }

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
      this.user = user;
      this.loadReclamation(user);
      this.loadSettings(); 
    });
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
        this.settings = { reclamationEmails: ['hafsifahed98@gmail.com', 'hafsifahed019@gmail.com'] };
      }
    );
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
          this.reclamation = data.filter(reclamation => 
            reclamation.user.partner.id === user.partner.id && !reclamation.archiveU
          );
          this.applyFilter();
        },
        (error) => {
          console.error('Error fetching reclamations for partner', error);
          Swal.fire('Erreur', 'Impossible de charger les réclamations', 'error');
        }
      );
    } else {
      this.reclamationService.getByIdUser(user.id).subscribe(
        (data) => {
          this.reclamation = data.filter(reclamation => !reclamation.archiveU);
          this.applyFilter();
        },
        (error) => {
          console.error('Error fetching user reclamations', error);
          Swal.fire('Erreur', 'Impossible de charger vos réclamations', 'error');
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
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => 
        reclamation.type_de_defaut === this.selectedType
      );
    }

    if (this.searchQuery.trim() !== '') {
      this.filteredReclamations = this.filteredReclamations.filter(reclamation => 
        reclamation.user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  getUniqueYears(): string[] {
    const years = this.reclamation.map(reclamation => 
      new Date(reclamation.dateDeCreation).getFullYear().toString()
    );
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
            text: "La réclamation a été supprimée avec succès.",
            icon: 'success'
          });
          this.reclamation = this.reclamation.filter(reclamation => 
            reclamation.id_reclamation !== this.rejectId
          );
          this.rejectId = null;
          this.applyFilter(); // Mettre à jour le filtre au lieu de recharger tout
          this.modalRef?.hide();
        },
        error => {
          console.error('Error deleting reclamation', error);
          Swal.fire('Erreur', 'Impossible de supprimer la réclamation', 'error');
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
      if (this.selectedFile) {
        this.reclamationService.uploadFile(this.selectedFile).subscribe(
          (uploadResult) => {
            this.createReclamationWithFile(uploadResult.filename);
          },
          (error) => {
            console.error('Erreur upload fichier', error);
            Swal.fire('Erreur', 'Erreur lors de l\'upload du fichier.', 'error');
          }
        );
      } else {
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
    const reclamationData = {
      type_de_defaut: this.reclamationForm.value.type_de_defaut,
      description: this.reclamationForm.value.description,
      PieceJointe: pieceJointe || null,
    };

    this.reclamationService.addreclamation(reclamationData).subscribe(
      (response) => {
        Swal.fire('Ajouté!', "La Réclamation a été ajoutée avec succès.", 'success');
        
        const emailData = {
          type_de_defaut: reclamationData.type_de_defaut,
          description: reclamationData.description,
          user: this.user
        };
        
        // Utiliser les emails des settings avec fallback
        const recipientEmails = this.settings?.reclamationEmails || ['hafsifahed98@gmail.com', 'hafsifahed019@gmail.com'];
        console.log('Envoi à:', recipientEmails);
        
        this.sendmail(recipientEmails, 'Nouvelle Réclamation', emailData);
        this.modalRef?.hide();
        this.reclamationForm.reset();
        this.selectedFile = null; // Reset du fichier sélectionné
        this.loadReclamation(this.user!); // Recharger les réclamations
      },
      (error) => {
        console.error('Error details:', error);
        Swal.fire('Erreur!', "Une erreur s'est produite lors de l'ajout de la Réclamation.", 'error');
      }
    );
  }

  sendmail(to: string[], subject: string, data: any) {
    const emailText = `
<div>
  <p><strong>Problème:</strong> ${data.type_de_defaut}</p>
  <p><strong>Email:</strong> ${data.user.email}</p>
  <p><strong>Partenaire:</strong> ${data.user.partner.name}</p>
  <p><strong>Client:</strong> ${data.user.username}</p>
  <p><strong>Description:</strong> ${data.description}</p>
</div>`;
    
    this.emailService.sendEmail(to, subject, emailText).subscribe(
      (response) => {
        console.log('Email envoyé avec succès:', response);
      },
      (error) => {
        console.error('Erreur envoi email:', error);
        // Ne pas afficher d'erreur à l'utilisateur pour ne pas perturber l'expérience
      }
    );
  }

  saveReclamation() {
    if (this.selectedFile) {
      this.reclamationService.uploadFile(this.selectedFile).subscribe(
        (filename) => {
          console.log('Pièce jointe téléchargée avec succès', filename);
        },
        (error) => {
          console.error('Error uploading file', error);
        }
      );
    }
  }
}