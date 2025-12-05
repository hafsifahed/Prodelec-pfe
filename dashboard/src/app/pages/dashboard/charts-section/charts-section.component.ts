import { Component, OnInit } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { ChartsStatisticsService } from 'src/app/core/services/charts-statistics.service';
import { jsPDF } from 'jspdf';
import { DatePipe } from '@angular/common';
import { UserStateService } from 'src/app/core/services/user-state.service';

interface FilterOptions {
  users: any[];
  partners: any[];
  years: number[];
}

interface UserFilter {
  id: number;
  email: string;
  username: string;
  partner?: { id: number; name: string };
}

interface PartnerFilter {
  id: number;
  name: string;
}

@Component({
  selector: 'app-charts-section',
  templateUrl: './charts-section.component.html',
  styleUrls: ['./charts-section.component.scss']
})
export class ChartsSectionComponent implements OnInit {
  selectedUser: number | null = null;
  selectedPartner: number | null = null;
  selectedYear: number | null = null;

  // Propriétés pour les filtres
  allUsers: UserFilter[] = [];
  filteredUsers: UserFilter[] = [];
  partners: PartnerFilter[] = [];
  years: number[] = [];
  userr: any;

  // Propriétés pour les données des charts
  chartOptionsReclamations: Partial<ApexOptions> | null = null;
  chartOptionsCahiersDesCharges: Partial<ApexOptions> | null = null;
  chartOptionsDevis: Partial<ApexOptions> | null = null;
  chartOptionsProjects: Partial<ApexOptions> | null = null;
  chartOptionsAvis: Partial<ApexOptions> | null = null;

  // CORRECTION: Réinitialiser à false
  hasReclamationData = false;
  hasCdcData = false;
  hasDevisData = false;
  hasProjectData = false;
  hasAvisData = false;

  // Propriétés pour les avis
  avisDetails: any[] = [];
  filteredAvis: any[] = [];
  averageAvis = 0;
  totalAvis = 0;

  isLoading = true;
  isExporting = false;

  // Données brutes pour l'export PDF
  private chartsData: any = {};

  constructor(
    private chartsStatsService: ChartsStatisticsService,
        private userStateService: UserStateService,

    private datePipe: DatePipe
  ) {}

  async ngOnInit() {
         this.userStateService.user$.subscribe(user => {
      this.userr = user;
    });
    await this.loadFilterOptions();
    await this.loadChartsData(false);
  }

  isWorker(): boolean {
  return !!this.userr && !this.userr.role?.name.toLowerCase().startsWith('client');
}
  private async loadFilterOptions(partnerId?: number) {
    try {
      const filterOptions = await this.chartsStatsService.getFilterOptions(partnerId).toPromise();
      this.allUsers = filterOptions?.users || [];
      this.partners = filterOptions?.partners || [];
      this.years = filterOptions?.years || [];
      
      this.filterUsersByPartner(this.selectedPartner);
    } catch (error) {
      console.error('Error loading filter options', error);
      this.allUsers = [];
      this.filteredUsers = [];
      this.partners = [];
      this.years = [];
    }
  }

  private filterUsersByPartner(partnerId: number | null) {
    if (partnerId) {
      this.filteredUsers = this.allUsers.filter(user => 
        user.partner && user.partner.id === partnerId
      );
    } else {
      this.filteredUsers = this.allUsers;
    }
    
    if (this.selectedUser && !this.filteredUsers.some(u => u.id === this.selectedUser)) {
      this.selectedUser = null;
    }
  }

  private async loadChartsData(includeAi) {
    this.isLoading = true;
    
    try {
      const filters = {
        userId: this.selectedUser || undefined,
        partnerId: this.selectedPartner || undefined,
        year: this.selectedYear || undefined,
        includeAi: includeAi
      };

      const data = await this.chartsStatsService.getChartsStatistics(filters).toPromise();
      
      // Stocker les données brutes pour l'export PDF
      this.chartsData = data || {};

      console.log('=== DONNÉES REÇUES POUR DEBUG ===');
      console.log('Données complètes:', data);
      console.log('Réclamations:', data?.reclamations);
      console.log('Cahiers des charges:', data?.cahiersDesCharges);
      console.log('Devis:', data?.devis);
      console.log('Projets:', data?.projects);
      console.log('Avis:', data?.avis);
      console.log(data);
      console.log('=== FIN DEBUG ===');

      // CORRECTION: Utiliser une vérification plus simple et plus fiable
      this.updateAllChartsWithState(data);

    } catch (error) {
      console.error('Error loading charts data', error);
      this.resetAllCharts();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * CORRECTION: Méthode unifiée pour mettre à jour tous les charts
   */
  private updateAllChartsWithState(data: any): void {
    // Réinitialiser tous les états
    this.hasReclamationData = false;
    this.hasCdcData = false;
    this.hasDevisData = false;
    this.hasProjectData = false;
    this.hasAvisData = false;

    // Mettre à jour chaque chart avec une logique simple
    if (data?.reclamations) {
      this.hasReclamationData = this.isChartDataValid(data.reclamations);
      if (this.hasReclamationData) {
        this.chartOptionsReclamations = this.buildPieChart(
          data.reclamations.series,
          data.reclamations.labels,
          data.reclamations.colors
        );
      }
    }

    if (data?.cahiersDesCharges) {
      this.hasCdcData = this.isChartDataValid(data.cahiersDesCharges);
      if (this.hasCdcData) {
        this.chartOptionsCahiersDesCharges = this.buildPieChart(
          data.cahiersDesCharges.series,
          data.cahiersDesCharges.labels,
          data.cahiersDesCharges.colors
        );
      }
    }

    if (data?.devis) {
      this.hasDevisData = this.isChartDataValid(data.devis);
      if (this.hasDevisData) {
        this.chartOptionsDevis = this.buildPieChart(
          data.devis.series,
          data.devis.labels,
          data.devis.colors
        );
      }
    }

    if (data?.projects) {
      this.hasProjectData = this.isChartDataValid(data.projects);
      if (this.hasProjectData) {
        this.chartOptionsProjects = this.buildPieChart(
          data.projects.series,
          data.projects.labels,
          data.projects.colors
        );
      }
    }

    // Gestion spéciale pour les avis
    if (data?.avis) {
      this.hasAvisData = this.isChartDataValid(data.avis);
      if (this.hasAvisData) {
        this.chartOptionsAvis = this.buildPieChart(
          data.avis.series,
          data.avis.labels,
          data.avis.colors
        );
      }
      
      this.avisDetails = data.avis.details || [];
      this.filteredAvis = data.avis.details || [];
      this.averageAvis = data.avis.average || 0;
      this.totalAvis = data.avis.totalAvis || 0;
    }
  }

  /**
   * CORRECTION: Méthode simple pour vérifier si les données du chart sont valides
   */
  private isChartDataValid(chartData: any): boolean {
    if (!chartData) return false;
    
    // Vérifier si les séries existent et sont un tableau non vide
    const hasSeries = chartData.series && 
                     Array.isArray(chartData.series) && 
                     chartData.series.length > 0;
    
    // Vérifier si les labels existent et sont un tableau non vide
    const hasLabels = chartData.labels && 
                     Array.isArray(chartData.labels) && 
                     chartData.labels.length > 0;
    
    // Vérifier si au moins une valeur dans les séries est > 0
    const hasNonZeroData = hasSeries && chartData.series.some((value: number) => value > 0);
    
    return hasSeries && hasLabels && hasNonZeroData;
  }

  private resetAllCharts() {
    this.hasReclamationData = false;
    this.hasCdcData = false;
    this.hasDevisData = false;
    this.hasProjectData = false;
    this.hasAvisData = false;
    
    this.chartOptionsReclamations = null;
    this.chartOptionsCahiersDesCharges = null;
    this.chartOptionsDevis = null;
    this.chartOptionsProjects = null;
    this.chartOptionsAvis = null;
    
    this.avisDetails = [];
    this.filteredAvis = [];
    this.averageAvis = 0;
    this.totalAvis = 0;
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

  // Filter change handlers
  onUserChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedUser = target.value ? +target.value : null;
    this.loadChartsData(false);
  }

  onPartnerChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const partnerId = target.value ? +target.value : null;
    
    this.selectedPartner = partnerId;
    this.selectedUser = null;
    
    this.filterUsersByPartner(partnerId);
    this.loadChartsData(false);
  }

  onYearChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedYear = target.value ? +target.value : null;
    this.loadChartsData(false);
  }

  resetFilters() {
    this.selectedUser = null;
    this.selectedPartner = null;
    this.selectedYear = null;
    
    this.filterUsersByPartner(null);
    this.loadChartsData(false);
  }

  /**
   * Export charts and statistics to PDF
   */
  async exportChartsToPdf(): Promise<void> {
    this.isExporting = true;

    try {
      // 1. Fetch fresh chart stats with AI analysis included before export
      const filters = {
        userId: this.selectedUser || undefined,
        partnerId: this.selectedPartner || undefined,
        year: this.selectedYear || undefined,
        includeAi: true  // Ensure AI is included here
      };
      const freshData = await this.chartsStatsService.getChartsStatistics(filters).toPromise();

      if (freshData) {
        this.chartsData = freshData;
        console.log('Fresh chart data:', freshData);

        // Update chart states according to fresh data
        this.updateAllChartsWithState(freshData);
      }

      // 2. Proceed with PDF generation using the fresh data
      const pdf = new jsPDF('landscape');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Load and add logo
      await this.addLogoToPdf(pdf, pageWidth, yPosition);
      yPosition += 25;

      this.addProfessionalHeader(pdf, pageWidth, yPosition);
      yPosition += 25;
      yPosition = this.addFilterInfo(pdf, pageWidth, yPosition);
      yPosition += 15;
      yPosition = this.addChartsSummary(pdf, pageWidth, yPosition);
      yPosition += 10;

      if (this.hasAnyChartData()) {
        yPosition = this.addChartsData(pdf, pageWidth, yPosition);
      } else {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Aucune donnée statistique disponible pour les filtres sélectionnés.', 20, yPosition);
        yPosition += 20;
      }

      if (this.hasAvisData && this.filteredAvis.length > 0) {
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = 20;
        }
        yPosition = this.addAvisDetails(pdf, pageWidth, yPosition);
      }
      yPosition = this.addAiAnalysisSection(pdf, yPosition);

      this.addProfessionalFooter(pdf, pageWidth);

      const fileName = this.generateChartsFileName();
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating charts PDF', error);
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
    pdf.text('RAPPORT DES GRAPHIQUES - ANALYSE STATISTIQUE', pageWidth / 2, yPosition, { align: 'center' });

    // Subtitle
    pdf.setFontSize(10);
    pdf.setTextColor(200, 200, 200);
    pdf.setFont('helvetica', 'normal');

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

    if (this.selectedYear) {
      filters.push(`Année: ${this.selectedYear}`);
    } else {
      filters.push('Année: Toutes');
    }

    if (this.selectedPartner) {
      const partner = this.partners.find(p => p.id === this.selectedPartner);
      filters.push(`Partenaire: ${partner?.name || 'N/A'}`);
    } else {
      filters.push('Partenaire: Tous');
    }

    if (this.selectedUser) {
      const user = this.allUsers.find(u => u.id === this.selectedUser);
      filters.push(`Utilisateur: ${user?.username || user?.email || 'N/A'}`);
    } else {
      filters.push('Utilisateur: Tous');
    }

    // Display filters in columns
    const columnWidth = (pageWidth - 60) / 3;
    filters.forEach((filter, index) => {
      const x = 30 + (index * columnWidth);
      pdf.text(filter, x, yPosition + 16);
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

    // Convert average from /100 to /5
    const noteSur5 = (this.averageAvis / 20).toFixed(1);

    const summaryCards = [
      { 
        title: 'GRAPHIQUES', 
        value: this.getAvailableChartsCount().toString(),
        subtitle: 'Disponibles',
        color: [41, 128, 185]
      },
      { 
        title: 'AVIS CLIENTS', 
        value: this.totalAvis.toString(),
        subtitle: 'Total collectés',
        color: [39, 174, 96]
      },
      { 
        title: 'SATISFACTION', 
        value: `${noteSur5}/5`,
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
        description: 'Répartition des types de réclamations et leur statut',
        data: this.chartsData.reclamations,
        color: [231, 76, 60]
      },
      { 
        name: 'CAHIERS DES CHARGES', 
        hasData: this.hasCdcData,
        description: 'Analyse des cahiers des charges par état et priorité',
        data: this.chartsData.cahiersDesCharges,
        color: [52, 152, 219]
      },
      { 
        name: 'DEVIS', 
        hasData: this.hasDevisData,
        description: 'Statistiques des devis par statut et montant',
        data: this.chartsData.devis,
        color: [155, 89, 182]
      },
      { 
        name: 'PROJETS', 
        hasData: this.hasProjectData,
        description: 'Répartition des projets par phase et avancement',
        data: this.chartsData.projects,
        color: [39, 174, 96]
      },
      { 
        name: 'AVIS CLIENTS', 
        hasData: this.hasAvisData,
        description: 'Distribution des notes de satisfaction client',
        data: this.chartsData.avis,
        color: [230, 126, 34]
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

      // Total row if available
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
   * Add AI Analysis Section with professional design
   */
  private addAiAnalysisSection(pdf: jsPDF, yPosition: number): number {
    if (!this.chartsData.aiAnalysis) return yPosition;

    const ai = this.chartsData.aiAnalysis;
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Check for page break
    if (yPosition > pdf.internal.pageSize.getHeight() - 100) {
      pdf.addPage();
      yPosition = 20;
    }

    // Section header
    pdf.setFillColor(142, 68, 173);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 8, 2, 2, 'F');
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('ANALYSE INTELLIGENCE ARTIFICIELLE', 25, yPosition + 5);
    yPosition += 15;

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);

    // Insights
    if (ai.insights) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRINCIPAUX INSIGHTS:', 20, yPosition);
      yPosition += 6;
      
      pdf.setFont('helvetica', 'normal');
      const insightLines = pdf.splitTextToSize(ai.insights, pageWidth - 40);
      pdf.text(insightLines, 25, yPosition);
      yPosition += (insightLines.length * 5) + 8;
    }

    // Trends
    if (ai.trends && ai.trends.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('TENDANCES IDENTIFIÉES:', 20, yPosition);
      yPosition += 6;

      ai.trends.forEach((trend: string) => {
        pdf.setFont('helvetica', 'normal');
        const trendLines = pdf.splitTextToSize(`• ${trend}`, pageWidth - 45);
        pdf.text(trendLines, 25, yPosition);
        yPosition += (trendLines.length * 5) + 2;
      });
      yPosition += 5;
    }

    // Recommendations
    if (ai.recommendations && ai.recommendations.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('RECOMMANDATIONS:', 20, yPosition);
      yPosition += 6;

      ai.recommendations.forEach((rec: string) => {
        pdf.setFont('helvetica', 'normal');
        const recLines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 45);
        pdf.text(recLines, 25, yPosition);
        yPosition += (recLines.length * 5) + 2;
      });
      yPosition += 5;
    }

    // Risk Areas
    if (ai.riskAreas && ai.riskAreas.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('ZONES DE RISQUE:', 20, yPosition);
      yPosition += 6;

      ai.riskAreas.forEach((risk: string) => {
        pdf.setFont('helvetica', 'normal');
        const riskLines = pdf.splitTextToSize(`• ${risk}`, pageWidth - 45);
        pdf.text(riskLines, 25, yPosition);
        yPosition += (riskLines.length * 5) + 2;
      });
      yPosition += 5;
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

    const noteSur5 = (this.averageAvis / 20).toFixed(1);
    pdf.text(`Note moyenne: ${noteSur5}/5 (sur ${this.totalAvis} avis)`, 20, yPosition);
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
    pdf.text('CLIENT', 25, yPosition + 4);
    pdf.text('NOTE', 80, yPosition + 4);
    pdf.text('COMMENTAIRE', 120, yPosition + 4);
    pdf.text('DATE', pageWidth - 25, yPosition + 4);

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
        pdf.text('CLIENT', 25, yPosition + 4);
        pdf.text('NOTE', 80, yPosition + 4);
        pdf.text('COMMENTAIRE', 120, yPosition + 4);
        pdf.text('DATE', pageWidth - 25, yPosition + 4);
        yPosition += 6;
      }

      const bgColor = index % 2 === 0 ? [255, 255, 255] : [245, 245, 245];
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(20, yPosition, tableWidth, 6, 'F');

      pdf.setFont('helvetica', 'normal');
      
      // Use correct properties based on your data structure
      const clientName = avis.nomPrenom || avis.clientName || avis.client?.name || 'N/A';
      const note = avis.note ? (avis.note / 20).toFixed(1) : 'N/A';
      const commentaire = avis.commentaire || avis.comment || 'Aucun commentaire';
      const date = avis.date || avis.createdAt || avis.dateCreation;
      
      pdf.text(this.truncateText(clientName, 20), 25, yPosition + 4);
      pdf.text(note.toString(), 80, yPosition + 4);
      pdf.text(this.truncateText(commentaire, 35), 120, yPosition + 4);
      
      const formattedDate = date ? this.datePipe.transform(date, 'dd/MM/yyyy') : 'N/A';
      pdf.text(formattedDate || 'N/A', pageWidth - 25, yPosition + 4);

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
    
    const footerText = `© ${new Date().getFullYear()} PRODELEC - Rapport analytique confidentiel généré automatiquement`;
    pdf.text(footerText, pageWidth / 2, pageHeight - 12, { align: 'center' });
    
    // Page number
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(`Page ${i} sur ${pageCount}`, pageWidth - 20, pageHeight - 12);
    }
  }

  /**
   * Vérifier s'il y a au moins un graphique avec des données
   */
  private hasAnyChartData(): boolean {
    return this.hasReclamationData || this.hasCdcData || this.hasDevisData || 
           this.hasProjectData || this.hasAvisData;
  }

  /**
   * Generate file name based on filters
   */
  private generateChartsFileName(): string {
    let fileName = 'rapport-graphiques';

    if (this.selectedYear) {
      fileName += `-${this.selectedYear}`;
    }

    if (this.selectedPartner) {
      const partner = this.partners.find(p => p.id === this.selectedPartner);
      if (partner) {
        // Remove spaces and special characters from partner name
        const cleanName = partner.name.replace(/[^a-zA-Z0-9]/g, '');
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
   * Truncate text to fit in PDF
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * CORRECTION: Méthode utilitaire pour debugger
   */
  private debugChartData(chartName: string, data: any): void {
    console.log(`=== DEBUG ${chartName} ===`);
    console.log('Data:', data);
    if (data) {
      console.log('Series:', data.series);
      console.log('Labels:', data.labels);
      console.log('Has series:', data.series && Array.isArray(data.series));
      console.log('Has labels:', data.labels && Array.isArray(data.labels));
      console.log('Series length:', data.series?.length);
      console.log('Labels length:', data.labels?.length);
      console.log('Has non-zero data:', data.series?.some((value: number) => value > 0));
      console.log('Is valid:', this.isChartDataValid(data));
    }
    console.log(`=== FIN DEBUG ${chartName} ===`);
  }
}