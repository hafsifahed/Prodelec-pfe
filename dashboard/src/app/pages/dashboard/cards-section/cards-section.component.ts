// cards-section.component.ts
import { Component, OnInit } from '@angular/core';
import { StatisticsService, GlobalStats, PeriodStats } from 'src/app/core/services/statistics.service';
import { AvisService } from 'src/app/core/services/avis.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { SettingService } from 'src/app/core/services/setting.service';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-cards-section',
  templateUrl: './cards-section.component.html',
  styleUrls: ['./cards-section.component.scss']
})
export class CardsSectionComponent implements OnInit {
  // Filtres de période
  periods = [
    { value: 'today', label: 'Aujourd\'hui', icon: 'bx bx-calendar-day' },
    { value: 'week', label: 'Cette semaine', icon: 'bx bx-calendar-week' },
    { value: 'month', label: 'Ce mois', icon: 'bx bx-calendar' },
    { value: 'year', label: 'Cette année', icon: 'bx bx-calendar-star' }
  ];

  selectedPeriod: string = 'month';
  availableYears: number[] = [];
  selectedYear?: number;
  
  // Données statistiques
  stats: GlobalStats = {
    totalOrders: 0,
    cancelledOrders: 0,
    totalProjects: 0,
    completedProjects: 0,
    lateProjects: 0,
    averageAvis: 0,
    reclamationRatio: 0,
    totalAvis: 0,
    newOrders: 0,
    newProjects: 0,
    sessions: {
      totalEmployees: 0,
      connectedEmployees: 0,
      totalClients: 0,
      connectedClients: 0
    }
  };

  comparativeStats?: PeriodStats;
  
  // Configuration
  setting: any;
  
  // États
  isLoading = true;
  hasComparativeData = false;
  isExporting = false;

  constructor(
    private statsSrv: StatisticsService,
    private avisSrv: AvisService,
    private projectSrv: ProjectService,
    private settingService: SettingService,
    private datePipe: DatePipe
  ) { }

  async ngOnInit() {
    // Charger la configuration
    this.settingService.getSettings().subscribe((res: any) => {
      this.setting = res;
    });

    await this.loadAvailableYears();
    // Charger les données initiales
    await this.loadStats();
  }

  // Charger les statistiques
  private async loadStats() {
    this.isLoading = true;
    
    try {
      const [globalStats, comparativeStats] = await Promise.all([
        this.statsSrv.getGlobalStats(this.selectedPeriod, this.selectedYear).toPromise(),
        this.statsSrv.getComparativeStats(this.selectedPeriod, this.selectedYear).toPromise()
      ]);

      if (globalStats) {
        this.stats = globalStats;
        console.log(this.stats);
      }
      
      if (comparativeStats) {
        this.comparativeStats = comparativeStats;
        this.hasComparativeData = !!comparativeStats.comparison;
      }
      
    } catch (error) {
      console.error('Error loading statistics', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadAvailableYears() {
    try {
      this.availableYears = await this.statsSrv.getAvailableYears().toPromise() || [];
      // Sélectionner l'année en cours par défaut si disponible
      const currentYear = new Date().getFullYear();
      if (this.availableYears.length > 0 && !this.availableYears.includes(currentYear)) {
        this.selectedYear = this.availableYears[0];
      } else {
        this.selectedYear = currentYear;
      }
    } catch (error) {
      console.error('Error loading available years', error);
    }
  }

  
  // Changer la période
  onPeriodChange(period: string) {
    this.selectedPeriod = period;
    this.loadStats();
    this.selectedYear = null;
  }
  onYearChange(year: number) {
    this.selectedYear = year;
    this.loadStats();
  }

  // Méthodes utilitaires pour les calculs
  getOrderProgress(): number {
    const total = this.stats.totalOrders;
    const cancelled = this.stats.cancelledOrders;
    return total > 0 ? ((total - cancelled) / total) * 100 : 0;
  }

  getCancellationRate(): number {
    const total = this.stats.totalOrders;
    const cancelled = this.stats.cancelledOrders;
    return total > 0 ? (cancelled / total) * 100 : 0;
  }

  getDelayedPercentage(): number {
    const total = this.stats.completedProjects + this.stats.totalProjects;
    const delayed = this.stats.lateProjects;
    return total > 0 ? (delayed / total) * 100 : 0;
  }

  // Méthodes pour les indicateurs de tendance
  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'bx bx-up-arrow-alt text-success';
      case 'down': return 'bx bx-down-arrow-alt text-danger';
      default: return 'bx bx-minus text-warning';
    }
  }

  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'danger';
      default: return 'warning';
    }
  }

  // Méthode utilitaire pour obtenir le libellé de la période
  getPeriodLabel(period: string): string {
    const periodMap: { [key: string]: string } = {
      'today': 'Aujourd\'hui',
      'week': 'Cette semaine',
      'month': 'Ce mois',
      'year': this.selectedYear ? `Année ${this.selectedYear}` : 'Cette année'
    };
    return periodMap[period] || period;
  }

  // Propriété pour l'heure actuelle
  get now(): Date {
    return new Date();
  }

  // Formatage des nombres
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  async exportToPdf(): Promise<void> {
    this.isExporting = true;

    try {
      // Fetch fresh global stats with AI analysis before export
      const freshStats = await this.statsSrv.getGlobalStats(this.selectedPeriod, this.selectedYear, true).toPromise();
      if (freshStats) {
        this.stats = freshStats;  // Update stats including AI analysis
      }

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Load and add logo
      await this.addLogoToPdf(pdf, pageWidth, yPosition);
      yPosition += 25;

      // Add professional header
      this.addProfessionalHeader(pdf, pageWidth, yPosition);
      yPosition += 25;

      // Add period information
      yPosition = this.addPeriodInfo(pdf, pageWidth, yPosition);
      yPosition += 10;

      // Add key metrics cards
      yPosition = this.addKeyMetricsCards(pdf, pageWidth, yPosition);
      yPosition += 15;

      // Add detailed statistics
      yPosition = this.addDetailedStatistics(pdf, pageWidth, yPosition);

      // Check for page break
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }

      // Add AI analysis section if exists
      if (this.stats.aiAnalysis) {
        yPosition = this.addAiAnalysisSection(pdf, yPosition);
      }

      // Add professional footer
      this.addProfessionalFooter(pdf, pageWidth);

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
        const logoWidth = 40;
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
    
    pdf.setFontSize(18);
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFont('helvetica', 'bold');
    pdf.text('RAPPORT STATISTIQUE', pageWidth / 2, yPosition, { align: 'center' });

    // Subtitle
    pdf.setFontSize(12);
    pdf.setTextColor(200, 200, 200);
    pdf.setFont('helvetica', 'normal');

    // Reset text color
    pdf.setTextColor(0, 0, 0);
  }

  /**
   * Add period information with professional styling
   */
  private addPeriodInfo(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    // Background for period info
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 20, 3, 3, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(52, 73, 94); // Dark blue text
    
    const periodLabel = this.getPeriodLabel(this.selectedPeriod);
    let periodText = `Période: ${periodLabel}`;
    
    if (this.selectedYear) {
      periodText += ` | Année: ${this.selectedYear}`;
    }

    pdf.text(periodText, pageWidth / 2, yPosition + 8, { align: 'center' });
    
    // Generation date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Généré le: ${this.datePipe.transform(new Date(), 'dd/MM/yyyy à HH:mm')}`, 
             pageWidth / 2, yPosition + 15, { align: 'center' });
    
    return yPosition + 25;
  }

  /**
   * Add key metrics cards with professional design
   */
  private addKeyMetricsCards(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(44, 62, 80);
    pdf.text('INDICATEURS CLÉS DE PERFORMANCE', 20, yPosition);
    yPosition += 10;

    const cardWidth = (pageWidth - 60) / 2;
    const cardHeight = 35;
    const metrics = [
      {
        title: 'COMMANDES',
        value: this.stats.totalOrders.toString(),
        subtitle: `Réussite: ${this.getOrderProgress().toFixed(1)}%`,
        color: [41, 128, 185]
      },
      {
        title: 'PROJETS',
        value: this.stats.totalProjects.toString(),
        subtitle: `Terminés: ${this.stats.completedProjects}`,
        color: [39, 174, 96]
      },
      {
        title: 'SATISFACTION',
        value: this.stats.averageAvis.toFixed(1),
        subtitle: `Sur 5 | ${this.stats.totalAvis} avis`,
        color: [142, 68, 173]
      },
      {
        title: 'RÉCLAMATIONS',
        value: this.stats.reclamationRatio.toFixed(1) + '%',
        subtitle: `Taux de traitement`,
        color: [231, 76, 60]
      }
    ];

    metrics.forEach((metric, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      
      const x = 20 + (col * (cardWidth + 20));
      const y = yPosition + (row * (cardHeight + 10));

      // Card background with border
      pdf.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, cardWidth, cardHeight, 5, 5, 'FD');

      // Title
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
      pdf.text(metric.title, x + 10, y + 8);

      // Main value
      pdf.setFontSize(16);
      pdf.setTextColor(44, 62, 80);
      pdf.text(metric.value, x + 10, y + 20);

      // Subtitle
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(metric.subtitle, x + 10, y + 28);
    });

    return yPosition + (Math.ceil(metrics.length / 2) * (cardHeight + 10)) + 10;
  }

  /**
   * Add detailed statistics with professional tables
   */
  private addDetailedStatistics(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(44, 62, 80);
    pdf.text('ANALYSE DÉTAILLÉE', 20, yPosition);
    yPosition += 15;

    // Orders Analysis Table
    yPosition = this.createTableSection(
      pdf, 
      'Performance des Commandes', 
      [
        ['Commandes totales', this.stats.totalOrders.toString()],
        ['Commandes réussies', (this.stats.totalOrders - this.stats.cancelledOrders).toString()],
        ['Commandes annulées', this.stats.cancelledOrders.toString()],
        ['Taux de réussite', this.getOrderProgress().toFixed(1) + '%'],
        ['Taux d\'annulation', this.getCancellationRate().toFixed(1) + '%']
      ],
      20, 
      yPosition, 
      pageWidth - 40,
      [52, 152, 219]
    );

    yPosition += 10;

    // Projects Analysis Table
    yPosition = this.createTableSection(
      pdf,
      'Performance des Projets',
      [
        ['Projets total', this.stats.totalProjects.toString()],
        ['Projets terminés', this.stats.completedProjects.toString()],
        ['Projets en retard', this.stats.lateProjects.toString()],
        ['Taux de retard', this.getDelayedPercentage().toFixed(1) + '%'],
        ['Nouveaux projets', (this.stats.newProjects || 0).toString()]
      ],
      20,
      yPosition,
      pageWidth - 40,
      [39, 174, 96]
    );

    return yPosition;
  }

  /**
   * Create a professional table section
   */
  private createTableSection(
    pdf: jsPDF, 
    title: string, 
    data: string[][], 
    x: number, 
    y: number, 
    width: number,
    color: number[]
  ): number {
    const rowHeight = 8;
    const headerHeight = 6;

    // Table header
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.roundedRect(x, y, width, headerHeight, 2, 2, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(title, x + 5, y + 4);

    y += headerHeight;

    // Table rows
    data.forEach((row, index) => {
      const bgColor = index % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
      
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(x, y, width, rowHeight, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      
      // Label
      pdf.setFont('helvetica', 'normal');
      pdf.text(row[0], x + 5, y + 5);
      
      // Value
      pdf.setFont('helvetica', 'bold');
      pdf.text(row[1], x + width - 5, y + 5, { align: 'right' });
      
      y += rowHeight;
    });

    return y;
  }

  /**
   * Add AI Analysis Section with professional design
   */
  private addAiAnalysisSection(pdf: jsPDF, yPosition: number): number {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Section header
    pdf.setFillColor(142, 68, 173);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 8, 2, 2, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('ANALYSE INTELLIGENCE ARTIFICIELLE', 25, yPosition + 5);
    yPosition += 15;

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);

    // Summary
    this.addAnalysisBlock(pdf, 'Résumé', this.stats.aiAnalysis.summary, 25, yPosition);
    yPosition += 25;

    // Strengths
    this.addAnalysisBlock(pdf, 'Points Forts', this.stats.aiAnalysis.strengths.join(', '), 25, yPosition);
    yPosition += 20;

    // Weaknesses
    this.addAnalysisBlock(pdf, 'Points d\'Amélioration', this.stats.aiAnalysis.weaknesses.join(', '), 25, yPosition);
    yPosition += 20;

    // Recommendations
    this.addAnalysisBlock(pdf, 'Recommandations', this.stats.aiAnalysis.recommendations.join(', '), 25, yPosition);
    yPosition += 25;

    return yPosition;
  }

  /**
   * Add analysis block with icon and text
   */
  private addAnalysisBlock(pdf: jsPDF, title: string, content: string, x: number, y: number): void {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(52, 73, 94);
    pdf.text(`${title}:`, x, y);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    // Split content to fit page width
    const lines = pdf.splitTextToSize(content, pdf.internal.pageSize.getWidth() - 50);
    pdf.text(lines, x + 5, y + 5);
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
    
    const footerText = `© ${new Date().getFullYear()} PRODELEC - Rapport confidentiel généré automatiquement`;
    pdf.text(footerText, pageWidth / 2, pageHeight - 12, { align: 'center' });
    
    // Page number
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(`Page ${i} sur ${pageCount}`, pageWidth - 20, pageHeight - 12);
    }
  }

  /**
   * Generate file name based on selected period and year
   */
  private generateFileName(): string {
    const periodMap: { [key: string]: string } = {
      'today': 'aujourdhui',
      'week': 'semaine',
      'month': 'mois',
      'year': 'annee'
    };

    let fileName = `rapport-statistiques-${periodMap[this.selectedPeriod]}`;
    
    if (this.selectedYear) {
      fileName += `-${this.selectedYear}`;
    }

    fileName += `-${this.datePipe.transform(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`;
    
    return fileName;
  }
}