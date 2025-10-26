import { Component, OnInit } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { ChartsStatisticsService } from 'src/app/core/services/charts-statistics.service';
import { jsPDF } from 'jspdf';
import { DatePipe } from '@angular/common';

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
    private datePipe: DatePipe
  ) {}

  async ngOnInit() {
    await this.loadFilterOptions();
    await this.loadChartsData();
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

  private async loadChartsData() {
    this.isLoading = true;
    
    try {
      const filters = {
        userId: this.selectedUser || undefined,
        partnerId: this.selectedPartner || undefined,
        year: this.selectedYear || undefined,
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
    this.loadChartsData();
  }

  onPartnerChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const partnerId = target.value ? +target.value : null;
    
    this.selectedPartner = partnerId;
    this.selectedUser = null;
    
    this.filterUsersByPartner(partnerId);
    this.loadChartsData();
  }

  onYearChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedYear = target.value ? +target.value : null;
    this.loadChartsData();
  }

  resetFilters() {
    this.selectedUser = null;
    this.selectedPartner = null;
    this.selectedYear = null;
    
    this.filterUsersByPartner(null);
    this.loadChartsData();
  }

  /**
   * Export charts and statistics to PDF
   */
  async exportChartsToPdf(): Promise<void> {
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

      // CORRECTION: Vérifier s'il y a des données avant d'ajouter les sections
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
      const fileName = this.generateChartsFileName();
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating charts PDF', error);
    } finally {
      this.isExporting = false;
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
   * Add header to PDF
   */
  private addPdfHeader(pdf: jsPDF, pageWidth: number, yPosition: number): void {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Rapport des Graphiques - Statistiques Détaillées', pageWidth / 2, yPosition, { align: 'center' });

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

    // Convert average from /100 to /5
    const noteSur5 = (this.averageAvis / 20).toFixed(1);

    const summaryData = [
      { label: 'Graphiques Disponibles', value: this.getAvailableChartsCount() },
      { label: 'Total Avis', value: this.totalAvis },
      { label: 'Moyenne Satisfaction', value: `${noteSur5}/5` },
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
        description: 'Répartition des types de réclamations et leur statut',
        data: this.chartsData.reclamations
      },
      { 
        name: 'Cahiers des Charges', 
        hasData: this.hasCdcData,
        description: 'Analyse des cahiers des charges par état et priorité',
        data: this.chartsData.cahiersDesCharges
      },
      { 
        name: 'Devis', 
        hasData: this.hasDevisData,
        description: 'Statistiques des devis par statut et montant',
        data: this.chartsData.devis
      },
      { 
        name: 'Projets', 
        hasData: this.hasProjectData,
        description: 'Répartition des projets par phase et avancement',
        data: this.chartsData.projects
      },
      { 
        name: 'Avis Clients', 
        hasData: this.hasAvisData,
        description: 'Distribution des notes de satisfaction client',
        data: this.chartsData.avis
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

      // Total row if available
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

    const noteSur5 = (this.averageAvis / 20).toFixed(1);
    pdf.text(`Note moyenne: ${noteSur5}/5 (sur ${this.totalAvis} avis)`, 20, yPosition);
    yPosition += 12;

    if (this.filteredAvis.length === 0) {
      pdf.text('Aucun avis détaillé disponible', 20, yPosition);
      return yPosition + 10;
    }

    // Table header
    pdf.setFillColor(200, 200, 200);
    pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Client', 25, yPosition + 5);
    pdf.text('Note', 80, yPosition + 5);
    pdf.text('Commentaire', 120, yPosition + 5);
    pdf.text('Date', pageWidth - 30, yPosition + 5);

    yPosition += 8;

    // Table rows
    this.filteredAvis.slice(0, 15).forEach((avis, index) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPosition = 20;
        pdf.setFillColor(200, 200, 200);
        pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.text('Client', 25, yPosition + 5);
        pdf.text('Note', 80, yPosition + 5);
        pdf.text('Commentaire', 120, yPosition + 5);
        pdf.text('Date', pageWidth - 30, yPosition + 5);
        yPosition += 8;
      }

      const bgColor = index % 2 === 0 ? [255, 255, 255] : [245, 245, 245];
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');

      pdf.setFont('helvetica', 'normal');
      
      // Use correct properties based on your data structure
      const clientName = avis.nomPrenom || avis.clientName || avis.client?.name || 'N/A';
      const note = avis.note ? (avis.note / 20).toFixed(1) : 'N/A';
      const commentaire = avis.commentaire || avis.comment || 'Aucun commentaire';
      const date = avis.date || avis.createdAt || avis.dateCreation;
      
      pdf.text(this.truncateText(clientName, 20), 25, yPosition + 5);
      pdf.text(note.toString(), 80, yPosition + 5);
      pdf.text(this.truncateText(commentaire, 35), 120, yPosition + 5);
      
      const formattedDate = date ? this.datePipe.transform(date, 'dd/MM/yyyy') : 'N/A';
      pdf.text(formattedDate || 'N/A', pageWidth - 30, yPosition + 5);

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
    pdf.text('© ' + new Date().getFullYear() + ' PRODELEC - Rapport des graphiques généré automatiquement', 
             pageWidth / 2, pageHeight - 10, { align: 'center' });
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