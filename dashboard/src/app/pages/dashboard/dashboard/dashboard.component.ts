// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD  (pages/dashboard/dashboard.component.ts)
// ─────────────────────────────────────────────────────────────────────────────
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApexOptions }                          from 'ng-apexcharts';

import { StatisticsService, GlobalStats }       from 'src/app/core/services/statistics.service';
import { AvisService }                          from 'src/app/core/services/avis.service';
import { UsersService }                         from 'src/app/core/services/user.service';
import { ReclamationService }                   from 'src/app/core/services/Reclamation/reclamation.service';
import { CdcServiceService }                    from 'src/app/core/services/cdcService/cdc-service.service';
import { DevisService }                         from 'src/app/core/services/Devis/devis.service';
import { OrderServiceService }                  from 'src/app/core/services/orderService/order-service.service';
import { ProjectService }                       from 'src/app/core/services/projectService/project.service';

import { AvisModels }         from 'src/app/core/models/avis.models';
import { Reclamation }        from 'src/app/core/models/reclamation';
import { CahierDesCharges }   from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { Devis }              from 'src/app/core/models/Devis/devis';
import { Order }              from 'src/app/core/models/order/order';
import { Project }            from 'src/app/core/models/projectfo/project';

@Component({
  selector   : 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls  : ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  /* ===========================================================================
   * 1.  PROPRIÉTÉS AFFICHÉES DANS LE TEMPLATE
   * ==========================================================================*/
  userType: 'user' | 'worker' = 'worker';

  // Cartes « Sessions »
  stats = {
    totalEmployees     : 0,
    connectedEmployees : 0,
    totalClients       : 0,
    connectedClients   : 0,
  };

  // Cartes numériques (Commandes / Projets / …)
  statData = [
    { icon: 'bx bx-copy-alt',     title: 'Commandes',           value: '0' },
    { icon: 'bx bx-copy-alt',     title: 'Projets',             value: '0' },
    { icon: 'bx bx-error-circle', title: 'Commandes annulées',  value: '0' },
    { icon: 'bx bx-check-circle', title: 'Projets terminés',    value: '0' },
    { icon: 'bx bx-error-circle', title: 'Projet retards',      value: '0' },
  ];

  // Satisfaction
  avisList: AvisModels[] = [];
  avgTotal = 0;

  // Ratio Réclamations / Projets (alerte)
  reclamationPercentage = 0;

  // Dropdowns & filtres
  years: number[] = [];
  users    : { id: number; email: string }[] = [];
  usersCdc : { id: number; email: string }[] = [];

  selectedYearReclamation: number | null = null;
  selectedUserReclamation: number | null = null;
  selectedYearCahier    : number | null = null;
  selectedUserCahier    : number | null = null;
  selectedYearDevis     : number | null = null;
  selectedUserDevis     : number | null = null;

  // Charts (ApexOptions)
  chartOptionsReclamations     : Partial<ApexOptions> = {};
  chartOptionsCahiersDesCharges: Partial<ApexOptions> = {};
  chartOptionsDevis            : Partial<ApexOptions> = {};
  chartOptionsProjet           : Partial<ApexOptions> = {};

  /* ===========================================================================
   * 2.  STOCKAGES INTERNES (non affichés directement)
   * ==========================================================================*/
   reclamations      : Reclamation[]      = [];
   cahiersDesCharges : CahierDesCharges[] = [];
   devis             : Devis[]            = [];
   orders            : Order[]            = [];
   ordersCancelled   : Order[]            = [];
   projects          : Project[]          = [];
   projectsCompleted : Project[]          = [];
   projectsLate      : Project[]          = [];

  /* ===========================================================================
   * 3.  CONSTRUCTEUR & INJECTIONS
   * ==========================================================================*/
  constructor(
    private statsSrv    : StatisticsService,
    private avisSrv     : AvisService,
    private usersSrv    : UsersService,
    private reclamSrv   : ReclamationService,
    private cdcSrv      : CdcServiceService,
    private devisSrv    : DevisService,
    private orderSrv    : OrderServiceService,
    private projectSrv  : ProjectService,
    private cdr         : ChangeDetectorRef,
  ) { }

  /* ===========================================================================
   * 4.  INIT  ──────────────────────────────────────────────────────────────── */
  async ngOnInit() {

    /* 4-1  Statistiques globales (backend) ---------------------------------- */
    this.statsSrv.getGlobalStats().subscribe({
      next : (g: GlobalStats) => {
        // Cartes numériques
        this.statData[0].value = g.totalOrders.toString();
        this.statData[1].value = g.totalProjects.toString();
        this.statData[2].value = g.cancelledOrders.toString();
        this.statData[3].value = g.completedProjects.toString();
        this.statData[4].value = g.lateProjects.toString();

        // Cartes sessions
        this.stats = g.sessions;

        // Ratio global
        this.reclamationPercentage = +g.reclamationRatio.toFixed(2);

        this.cdr.detectChanges();
      },
      error: err => console.error('[Dashboard] getGlobalStats KO', err),
    });

    /* 4-2  Données nécessaires aux filtres ---------------------------------- */
    await Promise.all([
      this.loadAvis(),
      this.loadReclamations(),
      this.loadCdc(),
      this.loadDevis(),
      this.loadOrdersAndProjects(),
      this.loadUsersForDropdowns(),
    ]);

    /* 4-3  Construction initiale des graphiques ----------------------------- */
    this.updateCharts();
  }

  /* ===========================================================================
   * 5.  CHARGEMENTS SECONDAIRES
   * ==========================================================================*/
  private async loadAvis() {
    this.avisList = await this.avisSrv.getAllAvis().toPromise();
    this.avgTotal = this.avisList.length
      ? +(this.avisList.reduce((s, a) => s + (a.avg ?? 0), 0) / this.avisList.length).toFixed(2)
      : 0;
  }

  private async loadReclamations() {
    this.reclamations = await this.reclamSrv.getAllreclamation().toPromise();
    // années distinctes
    this.years = [...new Set(this.reclamations.map(r => new Date(r.dateDeCreation).getFullYear()))].sort((a, b) => b - a);
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

    this.ordersCancelled   = this.orders.filter(o => o.annuler);
    this.projectsCompleted = this.projects.filter(p => p.progress === 100);
    this.projectsLate      = this.projects.filter(p => this.isLate(p));
  }

  private loadUsersForDropdowns() {
    this.usersSrv.getAllUsers().subscribe(list => {
      this.users = list.map(u => ({ id: u.id, email: u.email }));
      // Pour CDC : utilisateurs uniques
      const seen = new Set<number>();
      this.usersCdc = this.users.filter(u => {
        if (seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });
    });
  }

  /* ===========================================================================
   * 6.  HANDLERS DES DROPDOWNS
   * ==========================================================================*/
  onUserChangeReclamation(e: Event) { this.selectedUserReclamation = this.parseValue(e); this.updateReclamationChart(); }
  onYearChangeReclamation(e: Event) { this.selectedYearReclamation = this.parseValue(e); this.updateReclamationChart(); }

  onUserChangeCahier(e: Event)      { this.selectedUserCahier     = this.parseValue(e); this.updateCahierChart(); }
  onYearChangeCahier(e: Event)      { this.selectedYearCahier     = this.parseValue(e); this.updateCahierChart(); }

  onUserChangeDevis(e: Event)       { this.selectedUserDevis      = this.parseValue(e); this.updateDevisChart(); }
  onYearChangeDevis(e: Event)       { this.selectedYearDevis      = this.parseValue(e); this.updateDevisChart(); }

  private parseValue(e: Event): number | null {
    const v = (e.target as HTMLSelectElement).value;
    return v ? +v : null;
  }

  /* ===========================================================================
   * 7.  CONSTRUCTION / MÀJ DES GRAPHIQUES
   * ==========================================================================*/
  private updateCharts() {
    this.updateReclamationChart();
    this.updateCahierChart();
    this.updateDevisChart();
    this.updateProjectChart();
  }

  /* -------- Réclamations -------- */
  private updateReclamationChart() {
    const filtered = this.reclamations.filter(r =>
      (this.selectedYearReclamation ? new Date(r.dateDeCreation).getFullYear() === this.selectedYearReclamation : true) &&
      (this.selectedUserReclamation ? r.user.id === this.selectedUserReclamation : true)
    );

    const treated = filtered.filter(r => r.status === 'Traité').length;
    const ongoing = filtered.filter(r => r.status === 'En cours').length;

    this.chartOptionsReclamations = this.buildPie(
      [treated, ongoing],
      ['Traité', 'En cours'],
      ['#00E396', '#FFCC00']
    );
  }

  /* -------- Cahier des charges -------- */
  private updateCahierChart() {
    const filtered = this.cahiersDesCharges.filter(c =>
      (this.selectedYearCahier ? new Date(c.createdAt).getFullYear() === this.selectedYearCahier : true) &&
      (this.selectedUserCahier ? c.user.id === this.selectedUserCahier : true)
    );

    const accepted = filtered.filter(c => c.etat === 'Accepté').length;
    const refused  = filtered.filter(c => c.etat === 'Refusé').length;
    const pending  = filtered.filter(c => c.etat === 'en_attente').length;

    this.chartOptionsCahiersDesCharges = this.buildPie(
      [accepted, refused, pending],
      ['Accepté', 'Refusé', 'En attente'],
      ['#00E396', '#FF4560', '#0096FF']
    );
  }

  /* -------- Devis -------- */
  private updateDevisChart() {
    const filtered = this.devis.filter(d =>
      (this.selectedYearDevis ? new Date(d.dateCreation).getFullYear() === this.selectedYearDevis : true) &&
      (this.selectedUserDevis ? d.user.id === this.selectedUserDevis : true)
    );

    const accepted = filtered.filter(d => d.etat === 'Accepté').length;
    const refused  = filtered.filter(d => d.etat === 'Refusé').length;
    const pending  = filtered.filter(d => d.etat === 'En attente').length;

    this.chartOptionsDevis = this.buildPie(
      [accepted, refused, pending],
      ['Accepté', 'Refusé', 'En attente'],
      ['#00E396', '#FF4560', '#0096FF']
    );
  }

  /* -------- Projets (Livré / Retard) -------- */
  private updateProjectChart() {
    const delivered = this.projectsCompleted.length;
    const late      = this.projectsLate.length;

    this.chartOptionsProjet = this.buildPie(
      [delivered, late],
      ['Livré', 'Retard'],
      ['#00E396', '#FF4560']
    );
  }

  /* ===========================================================================
   * 8.  OUTILS
   * ==========================================================================*/
  private buildPie(series: number[], labels: string[], colors: string[]): Partial<ApexOptions> {
    return {
      series,
      chart: { type: 'pie', width: 380 },
      labels,
      legend: { position: 'bottom' },
      colors,
      responsive: [{
        breakpoint: 480,
        options: { chart: { width: 200 }, legend: { position: 'bottom' } }
      }]
    };
  }

  private isLate(p: Project): boolean {
    return !!p.dlp && p.progress !== 100 && new Date(p.dlp) < new Date();
  }
}
