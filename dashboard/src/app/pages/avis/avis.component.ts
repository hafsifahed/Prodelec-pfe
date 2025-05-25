import { Component, OnInit } from '@angular/core';
import { AvisModels } from "../../core/models/avis.models";
import { AvisService } from "../../core/services/avis.service";
import {Router} from "@angular/router";
import {Partner} from "../../core/models/partner.models";
import {NotificationService} from "../../core/services/notification.service";
import Swal from "sweetalert2";
import { User } from 'src/app/core/models/auth.models';
import { UsersService } from 'src/app/core/services/user.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-avis',
  templateUrl: './avis.component.html',
  styleUrls: ['./avis.component.scss']
})
export class AvisComponent implements OnInit {
  user: User | null = null;
  avis: AvisModels = new AvisModels();
  successMessage: string = '';
  errorMessage: string = '';
  submitted = false; // Define the submitted variable
  maxPoints = 5; // Nombre maximum de points forts/faibles
  visiblePointForts = 1; // Commence avec 1 champ visible
  visiblePointFaibles = 1; // Commence avec 1 champ visible
  pointFortInputValues: string[] = [''];
  pointFaibleInputValues: string[] = [''];
  
  currentSectionIndex = 0;
  sections = [
    'Devis',
    'Réactivité',
    'Développement',
    'Prestations',
    'SAV',
    'Éléments non contractuels',
    'Points Forts/Faibles'
  ];


  options = [
    { label: 'inacceptable (▼)', value: '1' },
    { label: 'Faible (►)', value: '2' },
    { label: 'satisfaction correcte (▲▲)', value: '3' },
    { label: 'Strong Satisfaction (▲▲▲)', value: '4' },
    
  ];

  attributes = [
    { key: 'conformiteExigences', label: 'Conformités à vos exigences' },
    { key: 'clartesimplicite', label: 'Clarté / simplicité' },
    { key: 'delaidereponse', label: 'Délai de réponse' },

    { key: 'reactiviteTechnique', label: 'A ses demandes d\'ordre technique' },
    { key: 'reactiviteReclamations', label: 'A ses réclamations' },
    { key: 'reactiviteOffres', label: 'A ses aspects d\'offres et ses consultations' },

    { key: 'gammeproduits', label: 'Notre gamme de produits' },
    { key: 'evolutionsTechnologiques', label: 'Notre aptitude à suivre les évolutions technologiques' },
    { key: 'performanceEtude', label: 'Notre performance en etude et conception' },

    { key: 'conformiteProduit', label: 'Conformité Produit' },
    { key: 'respectLivraison', label: 'Respect des engagements de livraison' },
    { key: 'documentationProduit', label: 'Documentation jointe au produit' },
    { key: 'respectSpecifications', label: 'Respect des Spécifications' },

    { key: 'conformiteBesoins', label: 'Conformité aux Besoins' },
    { key: 'delaisintervention', label: "Respect des délais d'intervention" },

    { key: 'accueilTelephonique', label: 'Accueil Téléphonique' },
    { key: 'qualiteRelationnelle', label: 'Qualité Relationnelle' },
    { key: 'reactivite', label: 'Réactivité' },
    { key: 'qualiteSite', label: 'Qualité du site Internet' },

  ];
   partners: Partner[];
   partnerObj: Partner;


  constructor(private avisService: AvisService,
              private usersService: UsersService,
               private router: Router,
                   private userStateService: UserStateService
               
  ) { }

  ngOnInit() {
    // this.loadUserProfile();

    this.userStateService.user$.subscribe(user => {
      this.user = user;
    });

  }


  submitAvis() {
    this.submitted = true;

    // Check if all required fields are filled
    const allRequiredFilled = this.attributes.every(attribute => {
      return this.avis[attribute.key] !== undefined && this.avis[attribute.key] !== null;
    });

    if (!allRequiredFilled) {
      this.showErrorMessage('Please fill in all required fields.');
      return; // Prevent submission if not all required fields are filled
    }

    if (this.user) {
      this.partnerObj = this.user.partner;
      if (this.partnerObj) {
        this.avis.visa = this.partnerObj.name;
        this.avis.user = this.user;
        this.calculateAverageRatings();

        this.avisService.saveAvisForUser(this.user.id, this.avis).subscribe(
            (response: AvisModels) => {
              this.showSuccessMessage('Avis soumis avec succès.');
              this.resetForm();
              this.router.navigate(['/list-avis']); // Redirect to the dashboard
            },
            (error) => {
              console.error('Error submitting review', error);
              this.showErrorMessage('Erreur lors de l\'envoi de l\'avis.');
            }
        );
      } else {
        this.showErrorMessage('Partenaire non trouvé.');
      }
    } else {
      this.showErrorMessage('Les données utilisateur ne sont pas disponibles. Veuillez réessayer ultérieurement.');
    }
  }

  resetForm() {
    this.avis = new AvisModels();
  }

  calculateAverageRatings() {
    let sumRatings = 0;
    let count = 0;

    this.attributes.forEach(attribute => {
      const key = attribute.key;
      const value = this.avis[key as keyof AvisModels];
      if (value && !isNaN(Number(value))) {
        sumRatings += Number(value);
        count++;
      }
    });

    this.avis.nomPrenom = this.user.firstName+" "+this.user.lastName;

    // Calculate the average rating
    const averageRating = count > 0 ? sumRatings / count : 0;

    // Calculate the percentage based on a maximum rating of 4
    const maxRating = 4; // Adjust this if your scale is different
    const averagePercentage = (averageRating / maxRating) * 100;

    // Set the avg property to the percentage
    this.avis.avg = Number(averagePercentage); // Store the average as a percentage
  }

  goBack() {
    this.router.navigate(['/']);
  }


  private showSuccessMessage(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      confirmButtonText: 'OK'
    });
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

 // Méthodes pour Points Forts
 getPointFortIndices(): number[] {
  return Array.from({length: this.visiblePointForts}, (_, i) => i + 1);
}

onPointFortInput(index: number) {
  // Vérifie si on doit afficher le bouton +
  this.pointFortInputValues[index - 1] = this.avis['pointFort' + index] || '';
}

showAddPointFortButton(): boolean {
  const lastIndex = this.visiblePointForts - 1;
  return this.visiblePointForts < this.maxPoints && 
         this.pointFortInputValues[lastIndex]?.trim().length > 0;
}

addPointFortField() {
  if (this.visiblePointForts < this.maxPoints) {
    this.visiblePointForts++;
    this.pointFortInputValues.push('');
  }
}

// Méthodes pour Points Faibles (similaires)
getPointFaibleIndices(): number[] {
  return Array.from({length: this.visiblePointFaibles}, (_, i) => i + 1);
}

onPointFaibleInput(index: number) {
  this.pointFaibleInputValues[index - 1] = this.avis['pointFaible' + index] || '';
}

showAddPointFaibleButton(): boolean {
  const lastIndex = this.visiblePointFaibles - 1;
  return this.visiblePointFaibles < this.maxPoints && 
         this.pointFaibleInputValues[lastIndex]?.trim().length > 0;
}

addPointFaibleField() {
  if (this.visiblePointFaibles < this.maxPoints) {
    this.visiblePointFaibles++;
    this.pointFaibleInputValues.push('');
  }
}

 // Navigation entre sections
 nextSection() {
  if (this.validateCurrentSection()) {
    if (this.currentSectionIndex < this.sections.length - 1) {
      this.currentSectionIndex++;
      this.errorMessage = '';
    }
  }
}

prevSection() {
  if (this.currentSectionIndex > 0) {
    this.currentSectionIndex--;
    this.errorMessage = '';
  }
}

validateCurrentSection(): boolean {
  // Validation spécifique à chaque section
  switch (this.currentSectionIndex) {
    case 0: // Devis
      return this.validateSection(this.attributes.slice(0, 3));
    case 1: // Réactivité
      return this.validateSection(this.attributes.slice(3, 6));
    case 2: // Développement
      return this.validateSection(this.attributes.slice(6, 9));
    case 3: // Prestations
      return this.validateSection(this.attributes.slice(9, 13));
    case 4: // SAV
      return this.validateSection(this.attributes.slice(13, 15));
    case 5: // Éléments non contractuels
      return this.validateSection(this.attributes.slice(15, 19));
    default:
      return true;
  }
}

validateSection(attributes: any[]): boolean {
  const isValid = attributes.every(attr => this.avis[attr.key]);
  
  if (!isValid) {
    this.errorMessage = "Veuillez remplir tous les champs obligatoires de cette section";
    return false;
  }
  
  return true;
}

  
}