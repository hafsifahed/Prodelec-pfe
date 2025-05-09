import { Component, OnInit } from '@angular/core';
import { AvisModels } from "../../core/models/avis.models";
import { AvisService } from "../../core/services/avis.service";
import { UsersService } from "../../core/services/users.service";
import { UserModel } from "../../core/models/user.models";
import {Router} from "@angular/router";
import {PartnersService} from "../../core/services/partners.service";
import {Partner} from "../../core/models/partner.models";
import {NotificationService} from "../../core/services/notification.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-avis',
  templateUrl: './avis.component.html',
  styleUrls: ['./avis.component.scss']
})
export class AvisComponent implements OnInit {
  user: UserModel | null = null;
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
              private usersService: UsersService, private router: Router,
              private partnersService: PartnersService,
              private notificationsService: NotificationService,

  ) { }

  ngOnInit() {
    if (this.userEmail) {
      this.fetchUser(this.userEmail);
      this.loadPartners();
    }


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
        this.calculateAverageRatings();

        this.avisService.saveAvisForUser(this.user.id, this.avis).subscribe(
            (response: AvisModels) => {
              this.showSuccessMessage('Avis soumis avec succès.');
              this.createNotification('Nouvel avis ajouté', 'Par: ' + this.userEmail + " le score =" + this.avis.avg.toFixed(2));
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
  loadPartners(): void {
    this.partnersService.getAllPartners()
        .subscribe(
            partners => {
              this.partners = partners;
            },
            error => {
              console.error('Error loading partners', error);
            }
        );
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // searchPartners(usermail: string): Partner {
  //   // Find the first partner based on user email
  //   const foundPartner = this.partners.find(partner =>
  //       partner.name.toLowerCase().includes(usermail.toLowerCase()) ||
  //       String(partner.id).includes(usermail) ||
  //       partner.users.some(user =>
  //           user.email.toLowerCase().includes(usermail.toLowerCase())
  //       )
  //   );

  //   return foundPartner;
  // }

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