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

  isWorker(): boolean {
  return !!this.user && !this.user.role?.name.toLowerCase().startsWith('client');
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
   * Export charts and statistics to PDF with professional design
   */
  async exportToPdf(): Promise<void> {
    this.isExporting = true;
    
    try {
      const pdf = new jsPDF('landscape');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Load and add logo
      await this.addLogoToPdf(pdf, pageWidth, yPosition);
      yPosition += 25;

      // Add professional header
      this.addProfessionalHeader(pdf, pageWidth, yPosition);
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

      // Add professional footer
      this.addProfessionalFooter(pdf, pageWidth);

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
   * Load and add company logo to PDF
   */
  private async addLogoToPdf(pdf: jsPDF, pageWidth: number, yPosition: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = 'assets/images/logoprodelec2024.png';
      
      img.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        const logoWidth = 35;
        const logoHeight = (img.height * logoWidth) / img.width;
        
        // Add logo to PDF
        pdf.addImage(img, 'PNG', 20, yPosition, logoWidth, logoHeight);
        resolve();
      };
      
      img.onerror = (error) => {
        console.warn('Logo not found, continuing without logo');
        resolve(); // Continue without logo
      };
    });
  }

  /**
   * Add professional header with styling
   */
  private addProfessionalHeader(pdf: jsPDF, pageWidth: number, yPosition: number): void {
    // Main title with styling
    pdf.setFillColor(41, 128, 185); // Blue background
    pdf.rect(0, yPosition - 10, pageWidth, 15, 'F');
    
    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFont('helvetica', 'bold');
    pdf.text('RAPPORT STATISTIQUE UTILISATEUR', pageWidth / 2, yPosition, { align: 'center' });

    // Subtitle
    pdf.setFontSize(10);
    pdf.setTextColor(200, 200, 200);
    pdf.setFont('helvetica', 'normal');

    // Generation date
    pdf.setFontSize(9);
    pdf.text(`Généré le: ${this.datePipe.transform(new Date(), 'dd/MM/yyyy à HH:mm')}`, pageWidth / 2, yPosition + 12, { align: 'center' });

    // Reset text color
    pdf.setTextColor(0, 0, 0);
  }

  /**
   * Add filter information to PDF with professional design
   */
  private addFilterInfo(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    // Background for filter info
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 25, 3, 3, 'F');
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(52, 73, 94);
    pdf.text('FILTRES APPLIQUÉS', pageWidth / 2, yPosition + 8, { align: 'center' });

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    
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

    // Display filters in columns
    const columnWidth = (pageWidth - 60) / 2;
    filters.forEach((filter, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = 30 + (column * columnWidth);
      const y = yPosition + 16 + (row * 6);
      pdf.text(filter, x, y);
    });

    return yPosition + 30;
  }

  /**
   * Add charts summary with professional cards
   */
  private addChartsSummary(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(44, 62, 80);
    pdf.text('RÉSUMÉ DES MÉTRIQUES', 20, yPosition);
    yPosition += 8;

    const summaryCards = [
      { 
        title: 'GRAPHIQUES', 
        value: this.getAvailableChartsCount().toString(),
        subtitle: 'Disponibles',
        color: [41, 128, 185]
      },
      { 
        title: 'AVIS CLIENTS', 
        value: this.filteredAvis.length.toString(),
        subtitle: 'Total collectés',
        color: [39, 174, 96]
      },
      { 
        title: 'SATISFACTION', 
        value: this.avgTotal.toFixed(1) + '%',
        subtitle: 'Note moyenne',
        color: [142, 68, 173]
      },
      { 
        title: 'COUVERTURE', 
        value: `${Math.round((this.getAvailableChartsCount() / 5) * 100)}%`,
        subtitle: 'Données disponibles',
        color: [230, 126, 34]
      }
    ];

    const cardWidth = (pageWidth - 60) / 4;
    const cardHeight = 25;

    summaryCards.forEach((card, index) => {
      const x = 20 + (index * (cardWidth + 5));
      const y = yPosition;

      // Card background with border
      pdf.setDrawColor(card.color[0], card.color[1], card.color[2]);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

      // Title
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(card.color[0], card.color[1], card.color[2]);
      pdf.text(card.title, x + 5, y + 6);

      // Main value
      pdf.setFontSize(11);
      pdf.setTextColor(44, 62, 80);
      pdf.text(card.value, x + 5, y + 15);

      // Subtitle
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(card.subtitle, x + 5, y + 21);
    });

    return yPosition + cardHeight + 15;
  }

  /**
   * Add charts data with professional tables
   */
  private addChartsData(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(44, 62, 80);
    pdf.text('ANALYSE DÉTAILLÉE PAR CATÉGORIE', 20, yPosition);
    yPosition += 10;

    const chartsData = [
      { 
        name: 'RÉCLAMATIONS', 
        hasData: this.hasReclamationData,
        description: 'Répartition des réclamations par statut',
        data: this.getReclamationDataForPdf(),
        color: [231, 76, 60]
      },
      { 
        name: 'CAHIERS DES CHARGES', 
        hasData: this.hasCdcData,
        description: 'Analyse des cahiers des charges par état',
        data: this.getCdcDataForPdf(),
        color: [52, 152, 219]
      },
      { 
        name: 'DEVIS', 
        hasData: this.hasDevisData,
        description: 'Statistiques des devis par statut',
        data: this.getDevisDataForPdf(),
        color: [155, 89, 182]
      },
      { 
        name: 'PROJETS', 
        hasData: this.hasProjectData,
        description: 'Répartition des projets par état',
        data: this.getProjectDataForPdf(),
        color: [39, 174, 96]
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
      if (currentY > pdf.internal.pageSize.getHeight() - 80) {
        pdf.addPage();
        currentY = 20;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ANALYSE DÉTAILLÉE PAR CATÉGORIE (SUITE)', 20, currentY);
        currentY += 15;
      }

      currentY = this.addProfessionalChartSection(pdf, pageWidth, currentY, chart);
      currentY += 10;
    });

    return currentY;
  }

  /**
   * Add professional chart section with styled tables
   */
  private addProfessionalChartSection(pdf: jsPDF, pageWidth: number, yPosition: number, chart: any): number {
    const sectionWidth = pageWidth - 40;
    
    // Section header with colored background
    pdf.setFillColor(chart.color[0], chart.color[1], chart.color[2]);
    pdf.roundedRect(20, yPosition, sectionWidth, 8, 2, 2, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(chart.name, 25, yPosition + 5);

    yPosition += 12;

    // Chart description
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text(chart.description, 20, yPosition);

    yPosition += 8;

    // Add chart data table if available
    if (chart.data && chart.data.labels && chart.data.series) {
      const tableWidth = sectionWidth;
      const labelColWidth = tableWidth * 0.7;
      const valueColWidth = tableWidth * 0.3;
      
      // Table header
      pdf.setFillColor(200, 200, 200);
      pdf.rect(20, yPosition, tableWidth, 6, 'F');
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('CATÉGORIE', 25, yPosition + 4);
      pdf.text('VALEUR', 25 + labelColWidth, yPosition + 4);
      
      yPosition += 6;

      // Table rows
      chart.data.labels.forEach((label: string, index: number) => {
        if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        const bgColor = index % 2 === 0 ? [255, 255, 255] : [250, 250, 250];
        pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        pdf.rect(20, yPosition, tableWidth, 6, 'F');

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(this.truncateText(label, 40), 25, yPosition + 4);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(chart.data.series[index].toString(), 25 + labelColWidth, yPosition + 4);

        yPosition += 6;
      });

      // Total row
      if (chart.data.total !== undefined) {
        pdf.setFillColor(220, 220, 220);
        pdf.rect(20, yPosition, tableWidth, 6, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('TOTAL', 25, yPosition + 4);
        pdf.text(chart.data.total.toString(), 25 + labelColWidth, yPosition + 4);
        
        yPosition += 6;
      }
    }

    return yPosition;
  }

  /**
   * Add avis details with professional table design
   */
  private addAvisDetails(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    // Section header
    pdf.setFillColor(230, 126, 34);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 8, 2, 2, 'F');
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('DÉTAILS DES AVIS CLIENTS', 25, yPosition + 5);
    yPosition += 15;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    pdf.text(`Note moyenne: ${this.avgTotal.toFixed(1)}% (sur ${this.filteredAvis.length} avis)`, 20, yPosition);
    yPosition += 10;

    if (this.filteredAvis.length === 0) {
      pdf.text('Aucun avis détaillé disponible', 20, yPosition);
      return yPosition + 10;
    }

    // Table header
    const tableWidth = pageWidth - 40;
    pdf.setFillColor(200, 200, 200);
    pdf.rect(20, yPosition, tableWidth, 6, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('UTILISATEUR', 25, yPosition + 4);
    pdf.text('PARTENAIRE', 80, yPosition + 4);
    pdf.text('SCORE', pageWidth - 25, yPosition + 4);

    yPosition += 6;

    // Table rows
    this.filteredAvis.slice(0, 15).forEach((avis, index) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPosition = 20;
        // Re-add table header on new page
        pdf.setFillColor(200, 200, 200);
        pdf.rect(20, yPosition, tableWidth, 6, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.text('UTILISATEUR', 25, yPosition + 4);
        pdf.text('PARTENAIRE', 80, yPosition + 4);
        pdf.text('SCORE', pageWidth - 25, yPosition + 4);
        yPosition += 6;
      }

      const bgColor = index % 2 === 0 ? [255, 255, 255] : [245, 245, 245];
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(20, yPosition, tableWidth, 6, 'F');

      pdf.setFont('helvetica', 'normal');
      
      const username = avis.user?.username || 'N/A';
      const partnerName = avis.user?.partner?.name || 'N/A';
      const score = (avis.avg ?? 0).toFixed(1) + '%';
      
      pdf.text(this.truncateText(username, 20), 25, yPosition + 4);
      pdf.text(this.truncateText(partnerName, 25), 80, yPosition + 4);
      pdf.text(score, pageWidth - 25, yPosition + 4);

      yPosition += 6;
    });

    if (this.filteredAvis.length > 15) {
      pdf.text(`... et ${this.filteredAvis.length - 15} autres avis`, 20, yPosition + 8);
      yPosition += 12;
    }

    return yPosition + 10;
  }

  /**
   * Add professional footer
   */
  private addProfessionalFooter(pdf: jsPDF, pageWidth: number): void {
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Footer background
    pdf.setFillColor(44, 62, 80);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    
    // Footer text
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    pdf.setFont('helvetica', 'normal');
    
    const footerText = `© ${new Date().getFullYear()} PRODELEC - Rapport utilisateur confidentiel généré automatiquement`;
    pdf.text(footerText, pageWidth / 2, pageHeight - 12, { align: 'center' });
    
    // Page number
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(`Page ${i} sur ${pageCount}`, pageWidth - 20, pageHeight - 12);
    }
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
   * Generate file name based on filters
   */
  private generateFileName(): string {
    let fileName = 'rapport-utilisateur';

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

    fileName += `-${this.datePipe.transform(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`;
    
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