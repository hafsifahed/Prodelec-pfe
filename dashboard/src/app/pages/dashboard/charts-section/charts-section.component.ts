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
import { CahierDesCharges, EtatCahier } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { Devis, EtatDevis } from 'src/app/core/models/Devis/devis';
import { Order } from 'src/app/core/models/order/order';
import { Project } from 'src/app/core/models/projectfo/project';

@Component({
  selector: 'app-charts-section',
  templateUrl: './charts-section.component.html',
  styleUrls: ['./charts-section.component.scss']
})
export class ChartsSectionComponent implements OnInit {
  selectedUser: number | null = null;
  selectedPartner: number | null = null;
  selectedYear: number | null = null;

  users: {
    id: number;
    email: string;
    username: string;
    partner?: { id: number; name: string };
  }[] = [];

  partners: { id: number; name: string }[] = [];
  years: number[] = [];

  chartOptionsReclamations: Partial<ApexOptions> | null = null;
  chartOptionsCahiersDesCharges: Partial<ApexOptions> | null = null;
  chartOptionsDevis: Partial<ApexOptions> | null = null;
  chartOptionsProjet: Partial<ApexOptions> | null = null;
  chartOptionsAvis: Partial<ApexOptions> | null = null;

  reclamations: Reclamation[] = [];
  cahiersDesCharges: CahierDesCharges[] = [];
  devis: Devis[] = [];
  orders: Order[] = [];
  projects: Project[] = [];
  avisList: AvisModels[] = [];

  filteredAvis: AvisModels[] = [];
  projectsCompleted: Project[] = [];
  projectsLate: Project[] = [];
  avgTotal = 0;

  hasReclamationData = true;
  hasCdcData = true;
  hasDevisData = true;
  hasProjectData = true;
  hasAvisData = true;

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
    await this.loadPartners();
    await this.loadUsersForDropdowns();
    await Promise.all([
      this.loadAvis(),
      this.loadReclamations(),
      this.loadCdc(),
      this.loadDevis(),
      this.loadOrdersAndProjects(),
    ]);
    this.generateYears();
    this.updateAllCharts();
  }

  private generateYears() {
    const allYears = [
      ...this.reclamations.map(r => new Date(r.dateDeCreation).getFullYear()),
      ...this.cahiersDesCharges.map(c => new Date(c.createdAt).getFullYear()),
      ...this.devis.map(d => new Date(d.dateCreation).getFullYear())
    ];
    this.years = [...new Set(allYears)].sort((a, b) => b - a);
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
    this.generateYears();
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
    try {
      this.partners = await this.partnerSrv.getAllPartners().toPromise();
    } catch (error) {
      console.error('Error loading partners', error);
      this.partners = [];
    }
  }

  private async loadUsersForDropdowns(partnerId?: number) {
    try {
      const users = await this.usersSrv.getClients().toPromise();
      this.users = partnerId ? users.filter(u => u.partner?.id === partnerId) : users;
      this.updatePartnersList();
    } catch (error) {
      console.error('Error loading users', error);
      this.users = [];
    }
  }

  private updatePartnersList() {
    if (this.selectedPartner) {
      const partnerExists = this.partners.some(p => p.id === this.selectedPartner);
      if (!partnerExists) {
        this.selectedPartner = null;
      }
      return;
    }
    this.partners = this.partners.filter(p =>
      this.users.some(u => u.partner?.id === p.id)
    );
  }

  onUserChange(e: Event) {
    this.selectedUser = this.parseValue(e);
    this.updateAllCharts();
  }

  async onPartnerChange(e: Event) {
    this.selectedPartner = this.parseValue(e);
    this.selectedUser = null;
    await this.loadUsersForDropdowns(this.selectedPartner || undefined);
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
    this.loadUsersForDropdowns();
    this.updateAllCharts();
  }

  private parseValue(e: Event): number | null {
    const v = (e.target as HTMLSelectElement).value;
    return v ? +v : null;
  }

  private updateAllCharts() {
    this.updateReclamationChart();
    this.updateCahierChart();
    this.updateDevisChart();
    this.updateProjectChart();
    this.updateAvisChart();
  }

  private updateReclamationChart() {
    const filtered = this.reclamations.filter(r => {
      const userMatch = this.selectedUser
        ? r.user.id === this.selectedUser
        : this.selectedPartner
          ? this.users.some(u => u.id === r.user.id)
          : true;
      return (
        (this.selectedYear ? new Date(r.dateDeCreation).getFullYear() === this.selectedYear : true) &&
        userMatch
      );
    });
    const treated = filtered.filter(r => r.status === 'Traité').length;
    const ongoing = filtered.filter(r => r.status === 'En cours').length;

    if (treated + ongoing === 0) {
      this.hasReclamationData = false;
      this.chartOptionsReclamations = null!;
    } else {
      this.hasReclamationData = true;
      this.chartOptionsReclamations = this.buildPie(
        [treated, ongoing],
        ['Traité', 'En cours'],
        ['#00E396', '#FFCC00']
      );
    }
  }

  private updateCahierChart() {
    const filtered = this.cahiersDesCharges.filter(c => {
      const userMatch = this.selectedUser
        ? c.user.id === this.selectedUser
        : this.selectedPartner
          ? this.users.some(u => u.id === c.user.id)
          : true;
      return (
        (this.selectedYear ? new Date(c.createdAt).getFullYear() === this.selectedYear : true) &&
        userMatch
      );
    });

    const accepted = filtered.filter(c => c.etat === EtatCahier.Accepte).length;
    const refused = filtered.filter(c => c.etat === EtatCahier.Refuse).length;
    const pending = filtered.filter(c => c.etat === EtatCahier.EnAttente).length;

    if (accepted + refused + pending === 0) {
      this.hasCdcData = false;
      this.chartOptionsCahiersDesCharges = null!;
    } else {
      this.hasCdcData = true;
      this.chartOptionsCahiersDesCharges = this.buildPie(
        [accepted, refused, pending],
        [EtatCahier.Accepte, EtatCahier.Refuse, EtatCahier.EnAttente],
        ['#00E396', '#FF4560', '#0096FF']
      );
    }
  }

  private updateDevisChart() {
    const filtered = this.devis.filter(d => {
      const userMatch = this.selectedUser
        ? d.user.id === this.selectedUser
        : this.selectedPartner
          ? this.users.some(u => u.id === d.user.id)
          : true;
      return (
        (this.selectedYear ? new Date(d.dateCreation).getFullYear() === this.selectedYear : true) &&
        userMatch
      );
    });

    const accepted = filtered.filter(d => d.etat === EtatDevis.Accepte).length;
    const refused = filtered.filter(d => d.etat === EtatDevis.Refuse).length;
    const pending = filtered.filter(d => d.etat === EtatDevis.EnAttente).length;

    if (accepted + refused + pending === 0) {
      this.hasDevisData = false;
      this.chartOptionsDevis = null!;
    } else {
      this.hasDevisData = true;
      this.chartOptionsDevis = this.buildPie(
        [accepted, refused, pending],
        ['Accepté', 'Refusé', 'En attente'],
        ['#00E396', '#FF4560', '#0096FF']
      );
    }
  }

  private updateProjectChart() {

    const deliveredCount = this.projectsCompleted.filter(p => {
      const userId = p.order?.user?.id;
      const userMatch = this.selectedUser
        ? userId === this.selectedUser
        : this.selectedPartner
          ? this.users.some(u => u.id === userId)
          : true;
      return (
        (this.selectedYear ? new Date(p.createdAt).getFullYear() === this.selectedYear : true) &&
        userMatch
      );
    }).length;

    const lateCount = this.projectsLate.filter(p => {
      const userId = p.order?.user?.id;
      const userMatch = this.selectedUser
        ? userId === this.selectedUser
        : this.selectedPartner
          ? this.users.some(u => u.id === userId)
          : true;
      return (
        (this.selectedYear ? new Date(p.createdAt).getFullYear() === this.selectedYear : true) &&
        userMatch
      );
    }).length;

    if (deliveredCount + lateCount === 0) {
      this.hasProjectData = false;
      this.chartOptionsProjet = null!;
    } else {
      this.hasProjectData = true;
      this.chartOptionsProjet = this.buildPie(
        [deliveredCount, lateCount],
        ['Livré', 'Retard'],
        ['#00E396', '#FF4560']
      );
    }
  }

  private updateAvisChart() {
    this.filteredAvis = this.avisList.filter(a => {
      const userMatch = this.selectedUser
        ? a.user?.id === this.selectedUser
        : this.selectedPartner
          ? a.user?.partner?.id === this.selectedPartner
          : true;
      return userMatch;
    });

    const nbPositifs = this.filteredAvis.filter(a => (a.avg ?? 0) >= 70).length;
    const nbMoyens = this.filteredAvis.filter(a => (a.avg ?? 0) >= 50 && (a.avg ?? 0) < 70).length;
    const nbNegatifs = this.filteredAvis.filter(a => (a.avg ?? 0) < 50).length;

    if (this.filteredAvis.length === 0) {
      this.hasAvisData = false;
      this.chartOptionsAvis = null!;
      return;
    }

    this.hasAvisData = true;
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
