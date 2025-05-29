import { Component, OnInit } from '@angular/core';
import { AvisService } from "../../../core/services/avis.service";
import {PartnersService} from "../../../core/services/partners.service";
import {Partner} from "../../../core/models/partner.models";
import {AvisModels} from "../../../core/models/avis.models";
import { Reclamation } from 'src/app/core/models/reclamation';
import { ReclamationService } from 'src/app/core/services/Reclamation/reclamation.service';
import { ChangeDetectorRef } from '@angular/core';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import { Devis } from 'src/app/core/models/Devis/devis';  // Add import for Devis model if applicable
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { Order } from 'src/app/core/models/order/order';
import { Project } from 'src/app/core/models/projectfo/project';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { UserSessionStats, UsersService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/auth.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  lastAvisDate: Date | null = null;
  showAlert: boolean = false;
  alertMessage: string = '';
  userType = "worker";
  user: any;
  errorMessage: string;
  users: User[] = [];
  partners: Partner[] = [];
    avisList: AvisModels[];

    avgTotal: number=0;
    totalWorkerConnect: number;
    reclamations: Reclamation[] = [];
    cahiersDesCharges: CahierDesCharges[] = [];
    devis: Devis[] = [];  // Add this for Devis data
    treatedPercentage: number = 0;
    ongoingPercentage: number = 0;
    acceptedPercentage: number = 0;
    refusedPercentage: number = 0;
    pendingPercentage: number = 0;
    acceptedDevisPercentage: number = 0;  // Add this for Devis statistics
    refusedDevisPercentage: number = 0;
    pendingDevisPercentage: number = 0;
    chartOptionsReclamations: any;
    chartOptionsProjet : any
    chartOptionsCahiersDesCharges: any;
    chartOptionsDevis: any;  // Add this for Devis chart options
    years: number[] = [];
    usersm: any[] = [];
    usersCdc : any [] = [];  // Array of unique users
    selectedYearReclamation: number | null = null;
    selectedUserReclamation: number | null = null;
    selectedYearCahier: number | null = null;
    selectedUserCahier: number | null = null;
    selectedYearDevis: number | null = null;  // Add this for Devis
    selectedUserDevis: number | null = null;  // Add this for Devis
    orders: Order[] = [];
  projects: Project[] = [];
  projectsterm: Project[] = [];
  ordersannuler: Order[] = [];
  projectretard: Project[] = [];
     stats :UserSessionStats= {
    totalEmployees: 0,
    connectedEmployees: 0,
    totalClients: 0,
    connectedClients: 0
  };


  statData = [
    {
      icon: 'bx bx-copy-alt',
      title: 'Commandes',
      value: ''
    },
    {
      icon: 'bx bx-copy-alt',
      title: 'Projets',
      value: ''
    },
    {
      icon: "bx bx-error-circle",
      title: "Commandes annulées",
      value: ""
    },
    {
      icon: "bx bx-check-circle",
      title: "Projets terminés",
      value: ""
    },
    {
      icon: "bx bx-error-circle",
      title: "Projet retards",
      value: ""
    },
  ];


  constructor(
      private avisService: AvisService,
      private usersService: UsersService,
      private partnersService: PartnersService,
      private reclamationService: ReclamationService,
    private cahierDesChargesService: CdcServiceService,
    private devisService: DevisService,
    private cdr: ChangeDetectorRef,
    private orderService: OrderServiceService,
    private projectService: ProjectService


  ) {}

   async ngOnInit() {
    this.usersSessionStats();
    this.loadPartners();
      this.loadAvis();

     this.fetchUsers();

     this.reclamations = await this.reclamationService.getAllreclamation().toPromise();
      this.cahiersDesCharges = await this.cahierDesChargesService.getAllCdc().toPromise();
      this.devis = await this.devisService.getAlldevis().toPromise();  // Fetch Devis data
      this.years = this.getYears(this.reclamations);
      this.users = this.getUsers(this.reclamations);
      this.usersCdc = this.getCDCUsers(this.cahiersDesCharges);
 

      this.orderService.getAllOrders().subscribe({
        next: (data) => {
          this.orders = data;
          this.ordersannuler = data.filter((order) => order.annuler);
          this.updateStatData();
        }
      });
  
      this.projectService.getAllProjects().subscribe({
        next: (data) => {
          this.projects = data;
          this.projectsterm = data.filter((project) => project.progress==100);
          this.projectretard = data.filter((project) => this.isDateOverdue(project.dlp,project));
          this.updateCharts();
          this.updateStatData();
        }
      });

      this.updateCharts();
 this.loadproject();

   }



  loadproject():void{
    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        this.projects = data;
this.calculateReclamationPercentage(data);
        this.updateStatData();
      }
    });
  }


  checkLastAvisDate(iduser: number) {
    this.avisService.getAvisByUserId(iduser).subscribe(
        (avisList) => {
          if (avisList && avisList.length > 0) {
            this.lastAvisDate = new Date(avisList[0].createdAt);
            const today = new Date();
            const threeMonthsAgo = new Date(today);
            threeMonthsAgo.setMonth(today.getMonth() - 3);

            if (this.lastAvisDate <= threeMonthsAgo) {
              this.showAlert = true;
              this.alertMessage = 'Votre dernier avis a été créé il y a plus de 3 mois. Pensez à ajouter un nouvel avis.';
            } else {
              this.showAlert = false;
            }
          } else {
            this.showAlert = true; // Show alert if the user does not have any avis
            this.alertMessage = 'Vous n\'avez pas encore d\'avis. Pensez à ajouter un avis.';
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération de la liste des avis', error);
        }
    );
  }


  reclamationPercentage: number = 0;
  calculateReclamationPercentage(projects : Project[]) {
    const totalReclamations = this.reclamations.length;
    const totalCompletedProjects = projects.length
    console.log(totalReclamations )

    console.log(totalCompletedProjects )

    if (totalCompletedProjects > 0) {
      this.reclamationPercentage = (totalReclamations / totalCompletedProjects) * 100;
    } else {
      this.reclamationPercentage = 0;
      console.log(this.reclamationPercentage)

    }
  }


  fetchUsers(): void {
    this.usersService.getAllUsers().subscribe(
        (users) => {
          this.users = users;
        },
        (error) => {
          console.error('Error fetching users', error);
        }
    );
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

    loadAvis() {
        this.avisService.getAllAvis().subscribe(
            avisList => {
                this.avisList = avisList;
                this.avgTotal=this.calculateAverageAvis(this.avisList);
                console.log('Avis list:', this.avisList);
            },
            error => {
                console.error('Error loading avis list', error);
            }
        );
    }
    calculateAverageAvis(avisList: AvisModels[]): number {
        const totalAvis = avisList.reduce((total, avisModel) => total + avisModel.avg, 0);
        return totalAvis / avisList.length;
    }


     
    getYears(reclamations: Reclamation[]): number[] {
      const years = reclamations.map(r => new Date(r.dateDeCreation).getFullYear());
      return Array.from(new Set(years)).sort((a, b) => b - a);
    }
  
    getUsers(reclamations: Reclamation[]): any[] {
      const userSet = new Set<number>();
      const uniqueUsers = reclamations.map(r => ({
        id: r.user.id,
        email: r.user.email
      })).filter(user => {
        if (userSet.has(user.id)) {
          return false;
        } else {
          userSet.add(user.id);
          return true;
        }
      });
      return uniqueUsers.sort((a, b) => a.email.localeCompare(b.email));
    }
  
    getCDCUsers(cahiersDesCharges: CahierDesCharges[]): any[] {
      const userSet = new Set<number>();
      const uniqueUsers = cahiersDesCharges.map(c => ({
        id: c.user.id,
        email: c.user.email
      })).filter(user => {
        if (userSet.has(user.id)) {
          return false;
        } else {
          userSet.add(user.id);
          return true;
        }
      });
      return uniqueUsers.sort((a, b) => a.email.localeCompare(b.email));
    }
  
    onUserChangeReclamation(event: Event) {
      const target = event.target as HTMLSelectElement;
      this.selectedUserReclamation = target.value ? +target.value : null;
      this.updateReclamationChart();
    }
  
    onYearChangeReclamation(event: Event) {
      const target = event.target as HTMLSelectElement;
      this.selectedYearReclamation = target.value ? +target.value : null;
      this.updateReclamationChart();
    }
  
    onUserChangeCahier(event: Event) {
      const target = event.target as HTMLSelectElement;
      this.selectedUserCahier = target.value ? +target.value : null;
      this.updateCahierDesChargesChart();
    }
  
    onYearChangeCahier(event: Event) {
      const target = event.target as HTMLSelectElement;
      this.selectedYearCahier = target.value ? +target.value : null;
      this.updateCahierDesChargesChart();
    }
  
    onUserChangeDevis(event: Event) {  // Add this for Devis
      const target = event.target as HTMLSelectElement;
      this.selectedUserDevis = target.value ? +target.value : null;
      this.updateDevisChart();
    }
  
    onYearChangeDevis(event: Event) {  // Add this for Devis
      const target = event.target as HTMLSelectElement;
      this.selectedYearDevis = target.value ? +target.value : null;
      this.updateDevisChart();
    }

    updateStatData() {
      this.statData[0].value = this.orders.length.toString();
      this.statData[1].value = this.projects.length.toString();
      this.statData[3].value = this.projectsterm.length.toString() ;
      this.statData[2].value = this.ordersannuler.length.toString();
      this.statData[4].value = this.projectretard.length.toString();
    }
    isDateOverdue(dlp: Date,p:Project): boolean {
      const today = new Date();
      if(dlp==null){
        return false;
      }
      return today > new Date(dlp) && p.progress !=100;
    }
  
    updateCharts() {
      this.updateReclamationChart();
      this.updateCahierDesChargesChart();
      this.updateDevisChart();  
      this.updateProjetChart();// Add this line
      this.cdr.detectChanges();  // Notify Angular to check for updates
    }
  
    updateReclamationChart() {
      const filteredReclamations = this.filterReclamations(this.reclamations);
      this.calculateReclamationPercentages(filteredReclamations);
      this.initReclamationChart();
    }
  
    updateCahierDesChargesChart() {
      const filteredCahiers = this.filterCahiersDesCharges(this.cahiersDesCharges);
      this.calculateCahierDesChargesPercentages(filteredCahiers);
      this.initCahierDesChargesChart();
    }
  
    updateDevisChart() {  // Add this for Devis
      const filteredDevis = this.filterDevis(this.devis);
      this.calculateDevisPercentages(filteredDevis);
      this.initDevisChart();
    }

      
    updateProjetChart() {  // Add this for Devis
 
      this.calculerPoucentageProjet();
      this.initProjet();
    }
  
    filterReclamations(reclamations: Reclamation[]): Reclamation[] {
      return reclamations.filter(r => {
        const matchesYear = this.selectedYearReclamation ? new Date(r.dateDeCreation).getFullYear() === this.selectedYearReclamation : true;
        const matchesUser = this.selectedUserReclamation ? r.user.id === this.selectedUserReclamation : true;
        return matchesYear && matchesUser;
      });
    }
  
    filterCahiersDesCharges(cahiers: CahierDesCharges[]): CahierDesCharges[] {
      return cahiers.filter(c => {
        const matchesYear = this.selectedYearCahier ? new Date(c.createdAt).getFullYear() === this.selectedYearCahier : true;
        const matchesUser = this.selectedUserCahier ? c.user.id === this.selectedUserCahier : true;
        return matchesYear && matchesUser;
      });
    }
  
    filterDevis(devis: Devis[]): Devis[] {  // Add this for Devis
      return devis.filter(d => {
        const matchesYear = this.selectedYearDevis ? new Date(d.dateCreation).getFullYear() === this.selectedYearDevis : true;
        const matchesUser = this.selectedUserDevis ? d.user.id === this.selectedUserDevis : true;
        return matchesYear && matchesUser;
      });
    }
  
    treatedCount: number = 0;
    ongoingCount: number = 0;
    calculateReclamationPercentages(reclamations: Reclamation[]) {
      const total = reclamations.length;
      const treated = reclamations.filter(r => r.status === 'Traité').length;
      const ongoing = reclamations.filter(r => r.status === 'En cours').length;

      this.treatedCount = treated;
      this.ongoingCount = ongoing;
      
      this.treatedPercentage = total > 0 ? (treated / total) * 100 : 0;
      this.ongoingPercentage = total > 0 ? (ongoing / total) * 100 : 0;
    }
  
    acceptedCount: number = 0;
    refusedCount: number = 0;
    pendingCount: number = 0;
 
    calculateCahierDesChargesPercentages(cahiers: CahierDesCharges[]) {
      const total = cahiers.length;
      const accepted = cahiers.filter(c => c.etat === 'Accepté').length;
      const refused = cahiers.filter(c => c.etat === 'Refusé').length;
      const pending = cahiers.filter(c => c.etat === 'en_attente').length;
  
      this.acceptedCount = accepted;
      this.refusedCount = refused;  
      this.pendingCount = pending;
      this.acceptedPercentage = total > 0 ? (accepted / total) * 100 : 0;
      this.refusedPercentage = total > 0 ? (refused / total) * 100 : 0;
      this.pendingPercentage = total > 0 ? (pending / total) * 100 : 0;
    }
  
    acceptedCountDevis: number = 0;
    refusedCountDevis: number = 0;
    pendingCountDevis: number = 0;
    calculateDevisPercentages(devis: Devis[]) {  // Add this for Devis
      const total = devis.length;
      const accepted = devis.filter(d => d.etat === 'Accepté').length;
      const refused = devis.filter(d => d.etat === 'Refusé').length;
      const pending = devis.filter(d => d.etat === 'En attente').length;
  
      this.acceptedCountDevis = accepted;
      this.refusedCountDevis = refused;
      this.pendingCountDevis = pending;

      this.acceptedDevisPercentage = total > 0 ? (accepted / total) * 100 : 0;
      this.refusedDevisPercentage = total > 0 ? (refused / total) * 100 : 0;
      this.pendingDevisPercentage = total > 0 ? (pending / total) * 100 : 0;
    }

    retardPourcentage : Number;
    livrePourcentage : Number;
    ProjetRetard : Number
    ProjetLivre : Number
    calculerPoucentageProjet(){

      const retard = this.projectretard.length;
      const total = this.projects.length;
      const livre = total - retard;
    
      // Mettre à jour les propriétés avec les valeurs calculées
      this.ProjetRetard = retard;
      this.ProjetLivre = livre;
    
      // Calculer les pourcentages de projets en retard et livrés
      this.retardPourcentage = total > 0 ? (retard / total) * 100 : 0;
      this.livrePourcentage = total > 0 ? (livre / total) * 100 : 0;

      console.log(retard)
      console.log(this.retardPourcentage,this.livrePourcentage)
      
    }

    private readonly CHART_CONFIG = {
      width: 380,
      type: 'pie' as const,
      responsiveBreakpoint: 480,
      responsiveWidth: 200
    };

    initProjet() {
      this.chartOptionsProjet = {
        series: [this.ProjetLivre, this.ProjetRetard],
        chart: {
          width: this.CHART_CONFIG.width,
          type: this.CHART_CONFIG.type
        },
        labels: ['Livré', 'Retard'],
        legend: { position: 'bottom' },
        colors: ['#00E396', '#FF4560'],
        responsive: [{
          breakpoint: this.CHART_CONFIG.responsiveBreakpoint,
          options: {
            chart: { width: this.CHART_CONFIG.responsiveWidth },
            legend: { position: 'bottom' }
          }
        }],
  
    
      };
    }

  
    initReclamationChart() {
      this.chartOptionsReclamations = {
        series: [this.treatedCount, this.ongoingCount],
        chart: {
          width: this.CHART_CONFIG.width,
          type: this.CHART_CONFIG.type
        },
        labels: ['Traité', 'En cours'],
        legend: { position: 'bottom' },
        colors: ['#00E396', '#FFCC00'],
        responsive: [{
          breakpoint: this.CHART_CONFIG.responsiveBreakpoint,
          options: {
            chart: { width: this.CHART_CONFIG.responsiveWidth },
            legend: { position: 'bottom' }
          }
        }],
  
    
      };
    }
  
    initCahierDesChargesChart() {
      this.chartOptionsCahiersDesCharges = {
        series: [this.acceptedCount, this.refusedCount, this.pendingCount],
        chart: {
          width: this.CHART_CONFIG.width,
          type: this.CHART_CONFIG.type
        },
        labels: ['Accepté', 'Refusé', 'En attente'],
        legend: { position: 'bottom' },
        colors: ['#00E396', '#FF4560', '#0096FF'],
        responsive: [{
          breakpoint: this.CHART_CONFIG.responsiveBreakpoint,
          options: {
            chart: { width: this.CHART_CONFIG.responsiveWidth },
            legend: { position: 'bottom' }
          }
        }]
      };
    }
  
    initDevisChart() {  // Add this for Devis
      this.chartOptionsDevis = {
        series: [this.acceptedCountDevis, this.refusedCountDevis, this.pendingCountDevis],
        chart: {
          width: this.CHART_CONFIG.width,
          type: this.CHART_CONFIG.type
        },
        labels: ['Accepté', 'Refusé', 'En attente'],
        legend: { position: 'bottom' },
        colors: ['#00E396', '#FF4560', '#0096FF'],
        responsive: [{
          breakpoint: this.CHART_CONFIG.responsiveBreakpoint,
          options: {
            chart: { width: this.CHART_CONFIG.responsiveWidth },
            legend: { position: 'bottom' }
          }
        }]
      };
    }

    usersSessionStats(){
      this.usersService.getUserSessionStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Erreur récupération stats', err)
    });
    }
}
