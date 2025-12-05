import { Component, OnInit } from '@angular/core';
import { AvisModels } from "../../core/models/avis.models";
import { AvisService } from "../../core/services/avis.service";
import { Router } from "@angular/router";
import { Partner } from "../../core/models/partner.models";
import Swal from "sweetalert2";
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { EmailService } from 'src/app/core/services/email.service'; // Ajout du service email
import { SettingService } from 'src/app/core/services/setting.service'; // Ajout du service settings

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
  submitted = false;
  maxPoints = 5;
  visiblePointForts = 1;
  visiblePointFaibles = 1;
  pointFortInputValues: string[] = [''];
  pointFaibleInputValues: string[] = [''];
  settings: any; // Pour stocker les paramètres
  
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
    { label: 'Très insatisfait (😠)', value: '1', icon: '😠' },
    { label: 'Insatisfait (😕)', value: '2', icon: '😕' },
    { label: 'Satisfait (😊)', value: '3', icon: '😊' },
    { label: 'Très satisfait (😍)', value: '4', icon: '😍' }
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

  constructor(
    private avisService: AvisService,
    private router: Router,
    private userStateService: UserStateService,
    private emailService: EmailService, // Injection du service email
    private settingService: SettingService // Injection du service settings
  ) { }

  ngOnInit() {
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
        this.settings = { avisEmails: ['hafsifahed98@gmail.com', 'hafsifahed019@gmail.com'] };
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
      return;
    }

    if (this.user) {
      this.partnerObj = this.user.partner;
      if (this.partnerObj) {
        this.avis.visa = this.partnerObj.name;
        this.avis.user = this.user;
        this.calculateAverageRatings();

        this.avisService.saveAvisForUser(this.avis).subscribe(
          (response: AvisModels) => {
            this.showSuccessMessage('Avis soumis avec succès.');
            
            // Envoyer l'email après l'ajout réussi
            this.sendAvisEmail(response);
            
            this.resetForm();
            this.router.navigate(['/dashboard']);
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

  // Méthode pour envoyer l'email d'avis
  sendAvisEmail(avis: AvisModels) {
    const emailData = {
      nomPrenom: avis.nomPrenom,
      email: this.user?.email,
      partenaire: this.user?.partner?.name,
      noteMoyenne: avis.avg + '%',
      visa: avis.visa,
      pointsForts: this.getPointsForts(avis),
      pointsFaibles: this.getPointsFaibles(avis)
    };

    // Utiliser les emails des settings ou une liste par défaut
    const recipientEmails = this.settings?.avisEmails || ['hafsifahed98@gmail.com', 'hafsifahed019@gmail.com'];
    
    this.sendmail(recipientEmails, 'Nouvel Avis Client', emailData);
  }

  // Méthode pour récupérer les points forts
  private getPointsForts(avis: AvisModels): string {
    const pointsForts = [];
    for (let i = 1; i <= this.maxPoints; i++) {
      const pointFort = avis['pointFort' + i as keyof AvisModels];
      if (pointFort && pointFort.toString().trim() !== '') {
        pointsForts.push(pointFort.toString());
      }
    }
    return pointsForts.length > 0 ? pointsForts.join(', ') : 'Aucun point fort mentionné';
  }

  // Méthode pour récupérer les points faibles
  private getPointsFaibles(avis: AvisModels): string {
    const pointsFaibles = [];
    for (let i = 1; i <= this.maxPoints; i++) {
      const pointFaible = avis['pointFaible' + i as keyof AvisModels];
      if (pointFaible && pointFaible.toString().trim() !== '') {
        pointsFaibles.push(pointFaible.toString());
      }
    }
    return pointsFaibles.length > 0 ? pointsFaibles.join(', ') : 'Aucun point faible mentionné';
  }

  // Méthode d'envoi d'email
  sendmail(to: string[], subject: string, data: any) {
    const emailText = `
<div>
  <h2>Nouvel Avis Client</h2>
  <p><strong>Nom & Prénom:</strong> ${data.nomPrenom}</p>
  <p><strong>Email:</strong> ${data.email}</p>
  <p><strong>Partenaire:</strong> ${data.partenaire}</p>
  <p><strong>Note Moyenne:</strong> ${data.noteMoyenne}</p>
  <p><strong>Points Forts:</strong> ${data.pointsForts}</p>
  <p><strong>Points Faibles:</strong> ${data.pointsFaibles}</p>
</div>`;
    
    this.emailService.sendEmail(to, subject, emailText).subscribe(
      (response) => {
        console.log('Email d\'avis envoyé avec succès:', response);
      },
      (error) => {
        console.error('Erreur envoi email d\'avis:', error);
      }
    );
  }

  resetForm() {
    this.avis = new AvisModels();
    this.visiblePointForts = 1;
    this.visiblePointFaibles = 1;
    this.pointFortInputValues = [''];
    this.pointFaibleInputValues = [''];
    this.currentSectionIndex = 0;
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

    this.avis.nomPrenom = this.user.firstName + " " + this.user.lastName;

    const averageRating = count > 0 ? sumRatings / count : 0;
    const maxRating = 4;
    const averagePercentage = (averageRating / maxRating) * 100;

    this.avis.avg = Number(averagePercentage.toFixed(2));
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

  // Les autres méthodes restent inchangées...
  getPointFortIndices(): number[] {
    return Array.from({length: this.visiblePointForts}, (_, i) => i + 1);
  }

  onPointFortInput(index: number) {
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
    switch (this.currentSectionIndex) {
      case 0:
        return this.validateSection(this.attributes.slice(0, 3));
      case 1:
        return this.validateSection(this.attributes.slice(3, 6));
      case 2:
        return this.validateSection(this.attributes.slice(6, 9));
      case 3:
        return this.validateSection(this.attributes.slice(9, 13));
      case 4:
        return this.validateSection(this.attributes.slice(13, 15));
      case 5:
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