import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { jsPDF } from 'jspdf';
import { DatePipe } from '@angular/common';

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

  allUsers: any[] = []; // Tous les utilisateurs du partenaire
  filteredUsers: any[] = []; // Utilisateurs filtrés (tous par défaut)
  years: number[] = [];

  chartOptionsReclamations: Partial<ApexOptions> | null = null;
  chartOptionsCahiersDesCharges: Partial<ApexOptions> | null = null;
  chartOptionsDevis: Partial<ApexOptions> | null = null;
  chartOptionsProjects: Partial<ApexOptions> | null = null;
  chartOptionsAvis: Partial<ApexOptions> | null = null;

  reclamations: Reclamation[] = [];
  cahiersDesCharges: CahierDesCharges[] = [];
  devis: Devis[] = [];
  orders: Order[] = [];
  projects: Project[] = [];
  avisList: AvisModels[] = [];

  filteredAvis: AvisModels[] = [];
  avgTotal = 0;

  hasReclamationData = false;
  hasCdcData = false;
  hasDevisData = false;
  hasProjectData = false;
  hasAvisData = false;

  isLoading = true;
  isExporting = false;

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
    private datePipe: DatePipe
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
    this.isLoading = true;
    
    try {
      if (this.roleName === 'CLIENTADMIN') {
        // Charger tous les utilisateurs du partenaire
        const allUsers = await this.usersSrv.getClients().toPromise();
        this.allUsers = allUsers.filter(u => u.partner?.id === this.partnerId);
        this.filteredUsers = this.allUsers; // Initialise avec tous les utilisateurs
        this.selectedUser = null; // Par défaut, tous les utilisateurs
      } else {
        // Uniquement l'utilisateur connecté
        this.allUsers = [this.user];
        this.filteredUsers = [this.user];
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
    } catch (error) {
      console.error('Error initializing data', error);
    } finally {
      this.isLoading = false;
    }
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
  }

  onUserChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedUser = target.value ? +target.value : null;
    this.updateAllCharts();
  }

  onYearChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedYear = target.value ? +target.value : null;
    this.updateAllCharts();
  }

  resetFilters() {
    if (this.roleName === 'CLIENTADMIN') {
      this.selectedUser = null;
    } else {
      this.selectedUser = this.user?.id;
    }
    this.selectedYear = null;
    this.updateAllCharts();
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
      const yearMatch = this.selectedYear 
        ? new Date(r.dateDeCreation).getFullYear() === this.selectedYear 
        : true;
      return userMatch && yearMatch;
    });
    
    const treated = filtered.filter(r => r.status === 'Traité').length;
    const ongoing = filtered.filter(r => r.status === 'En cours').length;

    if (treated + ongoing === 0) {
      this.hasReclamationData = false;
      this.chartOptionsReclamations = null;
    } else {
      this.hasReclamationData = true;
      this.chartOptionsReclamations = this.buildPieChart(
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
      const yearMatch = this.selectedYear 
        ? new Date(c.createdAt).getFullYear() === this.selectedYear 
        : true;
      return userMatch && yearMatch;
    });

    const accepted = filtered.filter(c => c.etat === EtatCahier.Accepte).length;
    const refused = filtered.filter(c => c.etat === EtatCahier.Refuse).length;
    const pending = filtered.filter(c => c.etat === EtatCahier.EnAttente).length;

    if (accepted + refused + pending === 0) {
      this.hasCdcData = false;
      this.chartOptionsCahiersDesCharges = null;
    } else {
      this.hasCdcData = true;
      this.chartOptionsCahiersDesCharges = this.buildPieChart(
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
      const yearMatch = this.selectedYear 
        ? new Date(d.dateCreation).getFullYear() === this.selectedYear 
        : true;
      return userMatch && yearMatch;
    });

    const accepted = filtered.filter(d => d.etat === EtatDevis.Accepte).length;
    const refused = filtered.filter(d => d.etat === EtatDevis.Refuse).length;
    const pending = filtered.filter(d => d.etat === EtatDevis.EnAttente).length;

    if (accepted + refused + pending === 0) {
      this.hasDevisData = false;
      this.chartOptionsDevis = null;
    } else {
      this.hasDevisData = true;
      this.chartOptionsDevis = this.buildPieChart(
        [accepted, refused, pending],
        [EtatDevis.Accepte, EtatDevis.Refuse, EtatDevis.EnAttente],
        ['#00E396', '#FF4560', '#0096FF']
      );
    }
  }

  private updateProjectChart() {
    const filteredProjects = this.projects.filter(p => {
      const userId = p.order?.user?.id;
      const userMatch = this.selectedUser
        ? userId === this.selectedUser
        : true;
      const yearMatch = this.selectedYear 
        ? new Date(p.createdAt).getFullYear() === this.selectedYear 
        : true;
      return userMatch && yearMatch;
    });

    const deliveredCount = filteredProjects.filter(p => p.progress === 100).length;
    const lateCount = filteredProjects.filter(p => this.isLate(p)).length;

    if (deliveredCount + lateCount === 0) {
      this.hasProjectData = false;
      this.chartOptionsProjects = null;
    } else {
      this.hasProjectData = true;
      this.chartOptionsProjects = this.buildPieChart(
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

    // Recalculer la moyenne pour les avis filtrés
    const filteredAvgTotal = this.filteredAvis.length
      ? +(this.filteredAvis.reduce((s, a) => s + (a.avg ?? 0), 0) / this.filteredAvis.length).toFixed(2)
      : 0;

    if (this.filteredAvis.length === 0) {
      this.hasAvisData = false;
      this.chartOptionsAvis = null;
      return;
    }

    this.hasAvisData = true;
    this.chartOptionsAvis = this.buildPieChart(
      [nbPositifs, nbMoyens, nbNegatifs],
      ['Satisfaits (≥70%)', 'Moyens (50-69%)', 'Insatisfaits (<50%)'],
      ['#00E396', '#FFCC00', '#FF4560']
    );

    // Mettre à jour la moyenne pour l'affichage
    this.avgTotal = filteredAvgTotal;
  }

  private buildPieChart(series: number[], labels: string[], colors: string[]): Partial<ApexOptions> {
    return {
      series,
      chart: {
        type: 'pie',
        width: 380,
        animations: { enabled: true, speed: 800 },
        foreColor: '#373d3f'
      },
      labels,
      legend: {
        position: 'bottom',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        markers: { radius: 12 }
      },
      colors,
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 300 },
          legend: { position: 'bottom' }
        }
      }],
      dataLabels: {
        enabled: true,
        style: { fontSize: '14px', fontFamily: 'Inter, sans-serif' }
      },
      plotOptions: {
        pie: {
          donut: { 
            labels: { 
              show: true, 
              total: { 
                show: true, 
                fontSize: '16px',
                label: 'Total'
              } 
            } 
          },
          expandOnClick: true
        }
      }
    };
  }

  private isLate(p: Project): boolean {
    return !!p.dlp && p.progress !== 100 && new Date(p.dlp) < new Date();
  }

  /**
   * Export charts and statistics to PDF
   */
  async exportToPdf(): Promise<void> {
    this.isExporting = true;
    
    try {
      const pdf = new jsPDF('landscape');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add header
      this.addPdfHeader(pdf, pageWidth, yPosition);
      yPosition += 25;

      // Add filter information
      yPosition = this.addFilterInfo(pdf, pageWidth, yPosition);
      yPosition += 15;

      // Add charts summary
      yPosition = this.addChartsSummary(pdf, pageWidth, yPosition);
      yPosition += 10;

      // Add charts data
      if (this.hasAnyChartData()) {
        yPosition = this.addChartsData(pdf, pageWidth, yPosition);
      } else {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Aucune donnée statistique disponible pour les filtres sélectionnés.', 20, yPosition);
        yPosition += 20;
      }

      // Add avis details if available
      if (this.hasAvisData && this.filteredAvis.length > 0) {
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = 20;
        }
        yPosition = this.addAvisDetails(pdf, pageWidth, yPosition);
      }

      // Add footer
      this.addPdfFooter(pdf, pageWidth);

      // Generate and download the PDF
      const fileName = this.generateFileName();
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF', error);
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Add header to PDF
   */
  private addPdfHeader(pdf: jsPDF, pageWidth: number, yPosition: number): void {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Rapport Statistique - Tableau de Bord Utilisateur', pageWidth / 2, yPosition, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Analyse des Performances et Métriques', pageWidth / 2, yPosition + 8, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text(`Généré le: ${this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, yPosition + 16, { align: 'center' });
  }

  /**
   * Add filter information to PDF
   */
  private addFilterInfo(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Filtres Appliqués', 20, yPosition);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const filters: string[] = [];

    // User filter
    if (this.selectedUser) {
      const user = this.allUsers.find(u => u.id === this.selectedUser);
      filters.push(`Utilisateur: ${user?.username || user?.email || 'N/A'}`);
    } else {
      filters.push('Utilisateur: Tous');
    }

    // Year filter
    if (this.selectedYear) {
      filters.push(`Année: ${this.selectedYear}`);
    } else {
      filters.push('Année: Toutes');
    }

    // Role information
    filters.push(`Rôle: ${this.roleName || 'N/A'}`);
    filters.push(`Partenaire: ${this.user?.partner?.name || 'N/A'}`);

    filters.forEach((filter, index) => {
      pdf.text(filter, 20, yPosition + 10 + (index * 6));
    });

    return yPosition + 10 + (filters.length * 6);
  }

  /**
   * Add charts summary to PDF
   */
  private addChartsSummary(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Résumé des Métriques', 20, yPosition);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    const summaryData = [
      { label: 'Graphiques Disponibles', value: this.getAvailableChartsCount() },
      { label: 'Total Avis', value: this.filteredAvis.length },
      { label: 'Moyenne Satisfaction', value: this.avgTotal.toFixed(1) + '%' },
      { label: 'Données Réclamations', value: this.hasReclamationData ? 'Disponible' : 'Non disponible' },
      { label: 'Données Cahiers Charges', value: this.hasCdcData ? 'Disponible' : 'Non disponible' },
      { label: 'Données Devis', value: this.hasDevisData ? 'Disponible' : 'Non disponible' },
      { label: 'Données Projets', value: this.hasProjectData ? 'Disponible' : 'Non disponible' }
    ];

    const columnWidth = (pageWidth - 60) / 3;
    let currentY = yPosition + 8;

    summaryData.forEach((item, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      
      const x = 20 + (column * columnWidth);
      const y = currentY + (row * 6);

      pdf.setFont('helvetica', 'bold');
      pdf.text(`${item.label}:`, x, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.value.toString(), x + 55, y);
    });

    return currentY + (Math.ceil(summaryData.length / 3) * 6) + 5;
  }

  /**
   * Add charts data to PDF
   */
  private addChartsData(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Détails par Catégorie', 20, yPosition);
    yPosition += 8;

    const chartsData = [
      { 
        name: 'Réclamations', 
        hasData: this.hasReclamationData,
        description: 'Répartition des réclamations par statut',
        data: this.getReclamationDataForPdf()
      },
      { 
        name: 'Cahiers des Charges', 
        hasData: this.hasCdcData,
        description: 'Analyse des cahiers des charges par état',
        data: this.getCdcDataForPdf()
      },
      { 
        name: 'Devis', 
        hasData: this.hasDevisData,
        description: 'Statistiques des devis par statut',
        data: this.getDevisDataForPdf()
      },
      { 
        name: 'Projets', 
        hasData: this.hasProjectData,
        description: 'Répartition des projets par état',
        data: this.getProjectDataForPdf()
      }
    ];

    // Filtrer seulement les graphiques avec des données réelles
    const availableCharts = chartsData.filter(chart => chart.hasData);
    let currentY = yPosition;

    if (availableCharts.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Aucune donnée disponible pour les catégories sélectionnées.', 20, currentY);
      return currentY + 10;
    }

    availableCharts.forEach((chart, index) => {
      // Check if we need a new page
      if (currentY > pdf.internal.pageSize.getHeight() - 50) {
        pdf.addPage();
        currentY = 20;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Détails par Catégorie (suite)', 20, currentY);
        currentY += 15;
      }

      currentY = this.addChartSection(pdf, pageWidth, currentY, chart);
      currentY += 10;
    });

    return currentY;
  }

  /**
   * Get reclamation data for PDF
   */
  private getReclamationDataForPdf(): any {
    const filtered = this.reclamations.filter(r => {
      const userMatch = this.selectedUser ? r.user.id === this.selectedUser : true;
      const yearMatch = this.selectedYear ? new Date(r.dateDeCreation).getFullYear() === this.selectedYear : true;
      return userMatch && yearMatch;
    });

    const treated = filtered.filter(r => r.status === 'Traité').length;
    const ongoing = filtered.filter(r => r.status === 'En cours').length;

    return {
      labels: ['Traité', 'En cours'],
      series: [treated, ongoing],
      total: filtered.length
    };
  }

  /**
   * Get CDC data for PDF
   */
  private getCdcDataForPdf(): any {
    const filtered = this.cahiersDesCharges.filter(c => {
      const userMatch = this.selectedUser ? c.user.id === this.selectedUser : true;
      const yearMatch = this.selectedYear ? new Date(c.createdAt).getFullYear() === this.selectedYear : true;
      return userMatch && yearMatch;
    });

    const accepted = filtered.filter(c => c.etat === EtatCahier.Accepte).length;
    const refused = filtered.filter(c => c.etat === EtatCahier.Refuse).length;
    const pending = filtered.filter(c => c.etat === EtatCahier.EnAttente).length;

    return {
      labels: [EtatCahier.Accepte, EtatCahier.Refuse, EtatCahier.EnAttente],
      series: [accepted, refused, pending],
      total: filtered.length
    };
  }

  /**
   * Get devis data for PDF
   */
  private getDevisDataForPdf(): any {
    const filtered = this.devis.filter(d => {
      const userMatch = this.selectedUser ? d.user.id === this.selectedUser : true;
      const yearMatch = this.selectedYear ? new Date(d.dateCreation).getFullYear() === this.selectedYear : true;
      return userMatch && yearMatch;
    });

    const accepted = filtered.filter(d => d.etat === EtatDevis.Accepte).length;
    const refused = filtered.filter(d => d.etat === EtatDevis.Refuse).length;
    const pending = filtered.filter(d => d.etat === EtatDevis.EnAttente).length;

    return {
      labels: [EtatDevis.Accepte, EtatDevis.Refuse, EtatDevis.EnAttente],
      series: [accepted, refused, pending],
      total: filtered.length
    };
  }

  /**
   * Get project data for PDF
   */
  private getProjectDataForPdf(): any {
    const filteredProjects = this.projects.filter(p => {
      const userId = p.order?.user?.id;
      const userMatch = this.selectedUser ? userId === this.selectedUser : true;
      const yearMatch = this.selectedYear ? new Date(p.createdAt).getFullYear() === this.selectedYear : true;
      return userMatch && yearMatch;
    });

    const deliveredCount = filteredProjects.filter(p => p.progress === 100).length;
    const lateCount = filteredProjects.filter(p => this.isLate(p)).length;

    return {
      labels: ['Livré', 'Retard'],
      series: [deliveredCount, lateCount],
      total: filteredProjects.length
    };
  }

  /**
   * Add individual chart section to PDF
   */
  private addChartSection(pdf: jsPDF, pageWidth: number, yPosition: number, chart: any): number {
    // Chart title
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(chart.name, 20, yPosition);

    // Chart description
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(chart.description, 20, yPosition + 5);

    yPosition += 10;

    // Add chart data table if available
    if (chart.data && chart.data.labels && chart.data.series) {
      const tableWidth = pageWidth - 40;
      const colWidth = tableWidth / 2;
      
      // Table header
      pdf.setFillColor(200, 200, 200);
      pdf.rect(20, yPosition, tableWidth, 8, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Catégorie', 25, yPosition + 5);
      pdf.text('Valeur', 25 + colWidth, yPosition + 5);
      
      yPosition += 8;

      // Table rows
      chart.data.labels.forEach((label: string, index: number) => {
        if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        const bgColor = index % 2 === 0 ? [255, 255, 255] : [245, 245, 245];
        pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        pdf.rect(20, yPosition, tableWidth, 8, 'F');

        pdf.setFont('helvetica', 'normal');
        pdf.text(this.truncateText(label, 30), 25, yPosition + 5);
        pdf.text(chart.data.series[index].toString(), 25 + colWidth, yPosition + 5);

        yPosition += 8;
      });

      // Total row
      if (chart.data.total !== undefined) {
        pdf.setFillColor(220, 220, 220);
        pdf.rect(20, yPosition, tableWidth, 8, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Total', 25, yPosition + 5);
        pdf.text(chart.data.total.toString(), 25 + colWidth, yPosition + 5);
        
        yPosition += 8;
      }
    }

    return yPosition;
  }

  /**
   * Add avis details to PDF
   */
  private addAvisDetails(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Détails des Avis Clients', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    pdf.text(`Note moyenne: ${this.avgTotal.toFixed(1)}% (sur ${this.filteredAvis.length} avis)`, 20, yPosition);
    yPosition += 12;

    if (this.filteredAvis.length === 0) {
      pdf.text('Aucun avis détaillé disponible', 20, yPosition);
      return yPosition + 10;
    }

    // Table header
    pdf.setFillColor(200, 200, 200);
    pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Utilisateur', 25, yPosition + 5);
    pdf.text('Partenaire', 80, yPosition + 5);
    pdf.text('Score', pageWidth - 30, yPosition + 5);

    yPosition += 8;

    // Table rows
    this.filteredAvis.slice(0, 15).forEach((avis, index) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPosition = 20;
        pdf.setFillColor(200, 200, 200);
        pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.text('Utilisateur', 25, yPosition + 5);
        pdf.text('Partenaire', 80, yPosition + 5);
        pdf.text('Score', pageWidth - 30, yPosition + 5);
        yPosition += 8;
      }

      const bgColor = index % 2 === 0 ? [255, 255, 255] : [245, 245, 245];
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');

      pdf.setFont('helvetica', 'normal');
      
      const username = avis.user?.username || 'N/A';
      const partnerName = avis.user?.partner?.name || 'N/A';
      const score = (avis.avg ?? 0).toFixed(1) + '%';
      
      pdf.text(this.truncateText(username, 20), 25, yPosition + 5);
      pdf.text(this.truncateText(partnerName, 25), 80, yPosition + 5);
      pdf.text(score, pageWidth - 30, yPosition + 5);

      yPosition += 8;
    });

    if (this.filteredAvis.length > 15) {
      pdf.text(`... et ${this.filteredAvis.length - 15} autres avis`, 20, yPosition + 5);
      yPosition += 10;
    }

    return yPosition + 10;
  }

  /**
   * Add footer to PDF
   */
  private addPdfFooter(pdf: jsPDF, pageWidth: number): void {
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('© ' + new Date().getFullYear() + ' PRODELEC - Rapport généré automatiquement', 
             pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  /**
   * Generate file name based on filters
   */
  private generateFileName(): string {
    let fileName = 'rapport-statistiques';

    if (this.selectedYear) {
      fileName += `-${this.selectedYear}`;
    }

    if (this.selectedUser) {
      const user = this.allUsers.find(u => u.id === this.selectedUser);
      if (user) {
        const cleanName = user.username?.replace(/[^a-zA-Z0-9]/g, '') || 'utilisateur';
        fileName += `-${cleanName}`;
      }
    }

    fileName += `-${this.datePipe.transform(new Date(), 'dd-MM-yyyy')}.pdf`;
    
    return fileName;
  }

  /**
   * Get count of available charts
   */
  private getAvailableChartsCount(): number {
    return [
      this.hasReclamationData,
      this.hasCdcData,
      this.hasDevisData,
      this.hasProjectData,
      this.hasAvisData
    ].filter(Boolean).length;
  }

  /**
   * Check if any chart has data
   */
  private hasAnyChartData(): boolean {
    return this.hasReclamationData || this.hasCdcData || this.hasDevisData || 
           this.hasProjectData || this.hasAvisData;
  }

  /**
   * Truncate text to fit in PDF
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}