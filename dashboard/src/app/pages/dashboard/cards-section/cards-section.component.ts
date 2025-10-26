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
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add header
      this.addPdfHeader(pdf, pageWidth, yPosition);
      yPosition += 30;

      // Add period information
      yPosition = this.addPeriodInfo(pdf, pageWidth, yPosition);
      yPosition += 15;

      // Add key statistics
      yPosition = this.addKeyStatistics(pdf, pageWidth, yPosition);
      
      // Add detailed statistics (check if we need a new page)
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 20;
      }
      
      yPosition = this.addDetailedStatistics(pdf, pageWidth, yPosition);

      // Add footer
      this.addPdfFooter(pdf, pageWidth);

      // Generate and download the PDF
      const fileName = this.generateFileName();
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF', error);
      // You might want to show a toast notification here
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Add header to PDF
   */
  private addPdfHeader(pdf: jsPDF, pageWidth: number, yPosition: number): void {
    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Rapport Statistique - Tableau de Bord', pageWidth / 2, yPosition, { align: 'center' });

    // Company name
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('PRODELEC', pageWidth / 2, yPosition + 8, { align: 'center' });

    // Date of generation
    pdf.setFontSize(10);
    pdf.text(`Généré le: ${this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, yPosition + 16, { align: 'center' });
  }

  /**
   * Add period information to PDF
   */
  private addPeriodInfo(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Période de Rapport', 20, yPosition);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const periodLabel = this.getPeriodLabel(this.selectedPeriod);
    let periodText = `Période: ${periodLabel}`;
    
    if (this.selectedYear) {
      periodText += ` - Année: ${this.selectedYear}`;
    }

    pdf.text(periodText, 20, yPosition + 8);
    
    return yPosition + 20;
  }

  /**
   * Add key statistics to PDF
   */
  private addKeyStatistics(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Indicateurs Clés', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      { label: 'Total Commandes', value: this.stats.totalOrders.toString() },
      { label: 'Commandes Annulées', value: this.stats.cancelledOrders.toString() },
      { label: 'Taux de Réussite', value: this.getOrderProgress().toFixed(1) + '%' },
      { label: 'Total Projets', value: this.stats.totalProjects.toString() },
      { label: 'Projets Terminés', value: this.stats.completedProjects.toString() },
      { label: 'Projets en Retard', value: this.stats.lateProjects.toString() },
      { label: 'Taux de Réclamation', value: this.stats.reclamationRatio.toFixed(1) + '%' },
      { label: 'Satisfaction Client', value: this.stats.averageAvis.toFixed(1) + '/5' },
      { label: 'Total Avis', value: this.stats.totalAvis.toString() }
    ];

    const columnWidth = (pageWidth - 60) / 2;
    let currentY = yPosition;

    stats.forEach((stat, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      
      const x = 20 + (column * columnWidth);
      const y = currentY + (row * 8);

      pdf.setFont('helvetica', 'bold');
      pdf.text(`${stat.label}:`, x, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(stat.value, x + 45, y);
    });

    return currentY + (Math.ceil(stats.length / 2) * 8) + 10;
  }

  /**
   * Add detailed statistics to PDF
   */
  private addDetailedStatistics(pdf: jsPDF, pageWidth: number, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Détails des Performances', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    
    // Orders Performance
    this.addSectionTitle(pdf, 'Performance des Commandes', 20, yPosition);
    yPosition += 8;
    
    const orderStats = [
      `Commandes totales: ${this.stats.totalOrders}`,
      `Commandes réussies: ${this.stats.totalOrders - this.stats.cancelledOrders}`,
      `Commandes annulées: ${this.stats.cancelledOrders}`,
      `Taux de réussite: ${this.getOrderProgress().toFixed(1)}%`,
      `Taux d'annulation: ${this.getCancellationRate().toFixed(1)}%`
    ];

    orderStats.forEach(stat => {
      pdf.text(stat, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Projects Performance
    this.addSectionTitle(pdf, 'Performance des Projets', 20, yPosition);
    yPosition += 8;

    const projectStats = [
      `Projets total: ${this.stats.totalProjects}`,
      `Projets terminés: ${this.stats.completedProjects}`,
      `Projets en retard: ${this.stats.lateProjects}`,
      `Taux de retard: ${this.getDelayedPercentage().toFixed(1)}%`,
      `Nouveaux projets: ${this.stats.newProjects || 0}`
    ];

    projectStats.forEach(stat => {
      pdf.text(stat, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Client Satisfaction
    this.addSectionTitle(pdf, 'Satisfaction Client', 20, yPosition);
    yPosition += 8;

    const satisfactionStats = [
      `Note moyenne: ${this.stats.averageAvis.toFixed(1)}/5`,
      `Total avis: ${this.stats.totalAvis}`,
      `Taux de réclamation: ${this.stats.reclamationRatio.toFixed(1)}%`
    ];

    satisfactionStats.forEach(stat => {
      pdf.text(stat, 25, yPosition);
      yPosition += 6;
    });

    return yPosition;
  }

  /**
   * Add section title to PDF
   */
  private addSectionTitle(pdf: jsPDF, title: string, x: number, y: number): void {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(title, x, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
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

    fileName += `-${this.datePipe.transform(new Date(), 'dd-MM-yyyy')}.pdf`;
    
    return fileName;
  }
  
}