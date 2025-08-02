import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';

import { AvisService } from 'src/app/core/services/avis.service';
import { UsersService } from 'src/app/core/services/user.service';
import { ReclamationService } from 'src/app/core/services/Reclamation/reclamation.service';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

import { AvisModels } from 'src/app/core/models/avis.models';
import { Reclamation } from 'src/app/core/models/reclamation';
import { CahierDesCharges, EtatCahier } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { Devis, EtatDevis } from 'src/app/core/models/Devis/devis';
import { Order } from 'src/app/core/models/order/order';
import { Project } from 'src/app/core/models/projectfo/project';

@Component({
  selector: 'app-charts-useradmin-section',
  templateUrl: './charts-useradmin-section.component.html',
  styleUrls: ['./charts-useradmin-section.component.scss']
})
export class ChartsUseradminSectionComponent implements OnInit {
  user: any;
  partnerId: number | null = null;
  roleName: string | null = null;

  selectedUser: number | null = null;
  selectedYear: number | null = null;

  users: any[] = [];
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
    private userStateService: UserStateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.userStateService.user$.subscribe(async user => {
      this.user = user;
      this.partnerId = user?.partner?.id ?? null;
      this.roleName = user?.role?.name ?? null;
      await this.initData();
      this.cdr.detectChanges();
    });
  }

  private async initData() {
    if (this.roleName === 'CLIENTADMIN') {
      // Charger tous les utilisateurs du partenaire
      const allUsers = await this.usersSrv.getClients().toPromise();
      this.users = allUsers.filter(u => u.partner?.id === this.partnerId);
    } else {
      // Uniquement l'utilisateur connecté
      this.users = [this.user];
      this.selectedUser = this.user?.id;
    }

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
    this.avisList = (await this.avisSrv.getAllAvis().toPromise())
      .filter(a => a.user?.partner?.id === this.partnerId);
    this.avgTotal = this.avisList.length
      ? +(this.avisList.reduce((s, a) => s + (a.avg ?? 0), 0) / this.avisList.length).toFixed(2)
      : 0;
    this.filteredAvis = [...this.avisList];
  }

  private async loadReclamations() {
    this.reclamations = (await this.reclamSrv.getAllreclamation().toPromise())
      .filter(r => r.user?.partner?.id === this.partnerId);
  }

  private async loadCdc() {
    this.cahiersDesCharges = (await this.cdcSrv.getAllCdc().toPromise())
      .filter(c => c.user?.partner?.id === this.partnerId);
  }

  private async loadDevis() {
    this.devis = (await this.devisSrv.getAlldevis().toPromise())
      .filter(d => d.user?.partner?.id === this.partnerId);
  }

  private async loadOrdersAndProjects() {
    [this.orders, this.projects] = await Promise.all([
      this.orderSrv.getAllOrders().toPromise(),
      this.projectSrv.getAllProjects().toPromise(),
    ]);
    this.projects = this.projects.filter(p => p.order?.user?.partner?.id === this.partnerId);
    this.projectsCompleted = this.projects.filter(p => p.progress === 100);
    this.projectsLate = this.projects.filter(p => this.isLate(p));
  }

  onUserChange(e: Event) {
    this.selectedUser = this.parseValue(e);
    this.updateAllCharts();
  }

  onYearChange(e: Event) {
    this.selectedYear = this.parseValue(e);
    this.updateAllCharts();
  }

  resetFilters() {
    this.selectedUser = this.roleName === 'CLIENTADMIN' ? null : this.user?.id;
    this.selectedYear = null;
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
        [EtatDevis.Accepte, EtatDevis.Refuse,EtatDevis.EnAttente],
        ['#00E396', '#FF4560', '#0096FF']
      );
    }
  }

  private updateProjectChart() {
    const deliveredCount = this.projectsCompleted.filter(p => {
      const userId = p.order?.user?.id;
      const userMatch = this.selectedUser
        ? userId === this.selectedUser
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
