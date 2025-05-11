import { Component, OnInit } from '@angular/core';
import { AvisModels } from "../../core/models/avis.models";
import { AvisService } from "../../core/services/avis.service";
import {Router} from "@angular/router";
import {PartnersService} from "../../core/services/partners.service";
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
  userEmail = localStorage.getItem('userMail') || '';
  submitted = false; // Define the submitted variable

  options = [
    { label: 'Strong Satisfaction (▲▲▲)', value: '4' },
    { label: 'satisfaction correcte (▲▲)', value: '3' },
    { label: 'Faible (►)', value: '2' },
    { label: 'inacceptable (▼)', value: '1' }
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

 /* private loadUserProfile(): void {
    this.usersService.getProfile().subscribe({
      next: (userData) => {
        this.user = userData;
        console.log('avis user partner'+this.user?.partner.id);

      },
      error: (error) => {
        console.error('Error fetching user profile', error);
        this.errorMessage = 'Failed to load user profile. Please try again later.';
      },
    });
  }*/

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
              this.router.navigate(['/dashboard']); // Redirect to the dashboard
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
    this.avis.avg = averagePercentage; // Store the average as a percentage
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
}