import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';

import { AvisService } from 'src/app/core/services/avis.service';
import { UsersService } from 'src/app/core/services/user.service';
import { ReclamationService } from 'src/app/core/services/Reclamation/reclamation.service';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { PartnersService } from 'src/app/core/services/partners.service';

import { AvisModels } from 'src/app/core/models/avis.models';
import { Reclamation } from 'src/app/core/models/reclamation';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { Devis } from 'src/app/core/models/Devis/devis';
import { Order } from 'src/app/core/models/order/order';
import { Project } from 'src/app/core/models/projectfo/project';

@Component({
  selector: 'app-charts-section',
  templateUrl: './charts-section.component.html',
  styleUrls: ['./charts-section.component.scss']
})
export class ChartsSectionComponent implements OnInit {
  // Filtres globaux
  selectedUser: number | null = null;
  selectedPartner: number | null = null;
  selectedYear: number | null = null;
  
  // Données pour les filtres
  users: { id: number; email: string, username: string }[] = [];
  partners: { id: number; name: string }[] = [];
  years: number[] = [];

  // Options des graphiques
  chartOptionsReclamations: Partial<ApexOptions> = {};
  chartOptionsCahiersDesCharges: Partial<ApexOptions> = {};
  chartOptionsDevis: Partial<ApexOptions> = {};
  chartOptionsProjet: Partial<ApexOptions> = {};
  chartOptionsAvis: Partial<ApexOptions> = {};

  // Données sources
  reclamations: Reclamation[] = [];
  cahiersDesCharges: CahierDesCharges[] = [];
  devis: Devis[] = [];
  orders: Order[] = [];
  projects: Project[] = [];
  avisList: AvisModels[] = [];
  
  // Données filtrées
  filteredAvis: AvisModels[] = [];
  projectsCompleted: Project[] = [];
  projectsLate: Project[] = [];
  avgTotal = 0;

  constructor(
    private avisSrv: AvisService,
    private usersSrv: UsersService,
    private reclamSrv: ReclamationService,
    private cdcSrv: CdcServiceService,
    private devisSrv: DevisService,
    private orderSrv: OrderServiceService,
    private projectSrv: ProjectService,
    private partnerSrv: PartnersService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadAvis(),
      this.loadReclamations(),
      this.loadCdc(),
      this.loadDevis(),
      this.loadOrdersAndProjects(),
      this.loadUsersForDropdowns(),
      this.loadPartners(),
    ]);

    this.updateAllCharts();
  }

  private async loadAvis() {
    this.avisList = await this.avisSrv.getAllAvis().toPromise();
    this.avgTotal = this.avisList.length
      ? +(this.avisList.reduce((s, a) => s + (a.avg ?? 0), 0) / this.avisList.length).toFixed(2)
      : 0;
    this.filteredAvis = [...this.avisList];
  }

  private async loadReclamations() {
    this.reclamations = await this.reclamSrv.getAllreclamation().toPromise();
    this.years = [...new Set([
      ...this.reclamations.map(r => new Date(r.dateDeCreation).getFullYear()),
      ...this.cahiersDesCharges.map(c => new Date(c.createdAt).getFullYear()),
      ...this.devis.map(d => new Date(d.dateCreation).getFullYear())
    ])].sort((a, b) => b - a);
  }

  private async loadCdc() {
    this.cahiersDesCharges = await this.cdcSrv.getAllCdc().toPromise();
  }

  private async loadDevis() {
    this.devis = await this.devisSrv.getAlldevis().toPromise();
  }

  private async loadOrdersAndProjects() {
    [this.orders, this.projects] = await Promise.all([
      this.orderSrv.getAllOrders().toPromise(),
      this.projectSrv.getAllProjects().toPromise(),
    ]);
    this.projectsCompleted = this.projects.filter(p => p.progress === 100);
    this.projectsLate = this.projects.filter(p => this.isLate(p));
  }

  private async loadPartners() {
    this.partners = await this.partnerSrv.getAllPartners().toPromise();
  }

  private loadUsersForDropdowns() {
    this.usersSrv.getClients().subscribe(list => {
      this.users = list.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        partnerId: u.partner?.id || null,
      }));
    });
  }

  // Gestion des changements de filtres globaux
  onUserChange(e: Event) { 
    this.selectedUser = this.parseValue(e); 
    this.updateAllCharts(); 
  }
  
  onPartnerChange(e: Event) { 
    this.selectedPartner = this.parseValue(e); 
    this.updateAllCharts(); 
  }
  
  onYearChange(e: Event) { 
    this.selectedYear = this.parseValue(e); 
    this.updateAllCharts(); 
  }

  resetFilters() {
    this.selectedUser = null;
    this.selectedPartner = null;
    this.selectedYear = null;
    this.updateAllCharts();
  }

  private parseValue(e: Event): number | null {
    const v = (e.target as HTMLSelectElement).value;
    return v ? +v : null;
  }

  // Mettre à jour tous les graphiques
  private updateAllCharts() {
    this.updateReclamationChart();
    this.updateCahierChart();
    this.updateDevisChart();
    this.updateProjectChart();
    this.updateAvisChart();
  }

  // Méthodes de mise à jour des graphiques avec filtres globaux
  private updateReclamationChart() {
    const filtered = this.reclamations.filter(r =>
      (this.selectedYear ? new Date(r.dateDeCreation).getFullYear() === this.selectedYear : true) &&
      (this.selectedUser ? r.user.id === this.selectedUser : true)
    );
    const treated = filtered.filter(r => r.status === 'Traité').length;
    const ongoing = filtered.filter(r => r.status === 'En cours').length;
    this.chartOptionsReclamations = this.buildPie([treated, ongoing], ['Traité', 'En cours'], ['#00E396', '#FFCC00']);
  }

  private updateCahierChart() {
    const filtered = this.cahiersDesCharges.filter(c =>
      (this.selectedYear ? new Date(c.createdAt).getFullYear() === this.selectedYear : true) &&
      (this.selectedUser ? c.user.id === this.selectedUser : true)
    );
    const accepted = filtered.filter(c => c.etat === 'Accepté').length;
    const refused = filtered.filter(c => c.etat === 'Refusé').length;
    const pending = filtered.filter(c => c.etat === 'en_attente').length;
    this.chartOptionsCahiersDesCharges = this.buildPie([accepted, refused, pending], ['Accepté', 'Refusé', 'En attente'], ['#00E396', '#FF4560', '#0096FF']);
  }

  private updateDevisChart() {
    const filtered = this.devis.filter(d =>
      (this.selectedYear ? new Date(d.dateCreation).getFullYear() === this.selectedYear : true) &&
      (this.selectedUser ? d.user.id === this.selectedUser : true)
    );
    const accepted = filtered.filter(d => d.etat === 'Accepté').length;
    const refused = filtered.filter(d => d.etat === 'Refusé').length;
    const pending = filtered.filter(d => d.etat === 'En attente').length;
    this.chartOptionsDevis = this.buildPie([accepted, refused, pending], ['Accepté', 'Refusé', 'En attente'], ['#00E396', '#FF4560', '#0096FF']);
  }

  private updateProjectChart() {
    const delivered = this.projectsCompleted.length;
    const late = this.projectsLate.length;
    this.chartOptionsProjet = this.buildPie([delivered, late], ['Livré', 'Retard'], ['#00E396', '#FF4560']);
  }

  private updateAvisChart() {
    this.filteredAvis = this.avisList.filter(a =>
      (!this.selectedUser || a.user?.id === this.selectedUser) &&
      (!this.selectedPartner || a.user?.partner?.id === this.selectedPartner)
    );

    const nbPositifs = this.filteredAvis.filter(a => (a.avg ?? 0) >= 70).length;
    const nbMoyens   = this.filteredAvis.filter(a => (a.avg ?? 0) >= 50 && (a.avg ?? 0) < 70).length;
    const nbNegatifs = this.filteredAvis.filter(a => (a.avg ?? 0) < 50).length;

    if (this.filteredAvis.length === 0) {
      this.chartOptionsAvis = this.buildPie(
        [1],
        ['Aucun avis trouvé'],
        ['#d3d3d3']
      );
      return;
    }

    this.chartOptionsAvis = this.buildPie(
      [nbPositifs, nbMoyens, nbNegatifs],
      ['Satisfaits (≥70%)', 'Moyens (50-69%)', 'Insatisfaits (<50%)'],
      ['#00E396', '#FFCC00', '#FF4560']
    );
  }

  private buildPie(series: number[], labels: string[], colors: string[]): Partial<ApexOptions> {
    return {
      series,
      chart: { type: 'pie', width: 380 },
      labels,
      legend: { position: 'bottom' },
      colors,
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
    };
  }

  private isLate(p: Project): boolean {
    return !!p.dlp && p.progress !== 100 && new Date(p.dlp) < new Date();
  }
}