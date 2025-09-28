import { Component, OnInit } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { ChartsStatisticsService } from 'src/app/core/services/charts-statistics.service';

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
  allUsers: UserFilter[] = []; // Tous les utilisateurs
  filteredUsers: UserFilter[] = []; // Utilisateurs filtrés par partenaire
  partners: PartnerFilter[] = [];
  years: number[] = [];

  // Propriétés pour les données des charts
  chartOptionsReclamations: Partial<ApexOptions> | null = null;
  chartOptionsCahiersDesCharges: Partial<ApexOptions> | null = null;
  chartOptionsDevis: Partial<ApexOptions> | null = null;
  chartOptionsProjects: Partial<ApexOptions> | null = null; // Corrigé le nom
  chartOptionsAvis: Partial<ApexOptions> | null = null;

  // Propriétés pour l'état des données
  hasReclamationData = true;
  hasCdcData = true;
  hasDevisData = true;
  hasProjectData = true; // Corrigé le nom
  hasAvisData = true;

  // Propriétés pour les avis
  avisDetails: any[] = [];
  filteredAvis: any[] = [];
  averageAvis = 0;
  totalAvis = 0;

  isLoading = true;

  constructor(private chartsStatsService: ChartsStatisticsService) {}

  async ngOnInit() {
    await this.loadFilterOptions();
    await this.loadChartsData();
  }

  private async loadFilterOptions(partnerId?: number) {
    try {
      const filterOptions = await this.chartsStatsService.getFilterOptions(partnerId).toPromise();
      this.allUsers = filterOptions?.users || [];
      this.filteredUsers = this.allUsers; // Initialise avec tous les utilisateurs
      this.partners = filterOptions?.partners || [];
      this.years = filterOptions?.years || [];
      
      // Filtre les utilisateurs si un partenaire est sélectionné
      if (this.selectedPartner) {
        this.filterUsersByPartner(this.selectedPartner);
      }
    } catch (error) {
      console.error('Error loading filter options', error);
      this.allUsers = [];
      this.filteredUsers = [];
      this.partners = [];
      this.years = [];
    }
  }

  private filterUsersByPartner(partnerId: number) {
    this.filteredUsers = this.allUsers.filter(user => 
      user.partner && user.partner.id === partnerId
    );
    
    // Réinitialise la sélection d'utilisateur si l'utilisateur sélectionné n'appartient pas au partenaire
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
      console.log('Charts data:', data);

      // Update charts avec gestion des états
      this.updateChartWithState('reclamations', data.reclamations);
      this.updateChartWithState('cahiersDesCharges', data.cahiersDesCharges);
      this.updateChartWithState('devis', data.devis);
      this.updateChartWithState('projects', data.projects); // Corrigé le nom
      
      // Special handling for avis
      this.updateAvisChartWithState(data.avis);
      this.avisDetails = data.avis.details || [];
      this.filteredAvis = data.avis.details || [];
      this.averageAvis = data.avis.average || 0;
      this.totalAvis = data.avis.totalAvis || 0;

    } catch (error) {
      console.error('Error loading charts data', error);
      this.resetAllCharts();
    } finally {
      this.isLoading = false;
    }
  }

  private updateChartWithState(chartName: string, chartData: any) {
    const hasData = chartData && chartData.total > 0;
    
    // Mettre à jour l'état des données
    const propertyName = `has${this.capitalize(chartName)}Data`;
    this[propertyName] = hasData;
    
    if (!hasData) {
      const chartPropertyName = `chartOptions${this.capitalize(chartName)}`;
      this[chartPropertyName] = null;
      return;
    }

    const chartPropertyName = `chartOptions${this.capitalize(chartName)}`;
    this[chartPropertyName] = this.buildPieChart(
      chartData.series,
      chartData.labels,
      chartData.colors
    );
  }

  private updateAvisChartWithState(avisData: any) {
    const hasData = avisData && avisData.total > 0;
    
    this.hasAvisData = hasData;
    
    if (!hasData) {
      this.chartOptionsAvis = null;
      return;
    }

    this.chartOptionsAvis = this.buildPieChart(
      avisData.series,
      avisData.labels,
      avisData.colors
    );
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

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Filter change handlers
  onUserChange(event: Event) {
    this.selectedUser = this.parseValue(event);
    this.loadChartsData();
  }

  onPartnerChange(event: Event) {
    const partnerId = this.parseValue(event);
    this.selectedPartner = partnerId;
    this.selectedUser = null; // Reset user selection
    
    // Recharge les options de filtre avec le partenaire sélectionné
    this.loadFilterOptions(partnerId).then(() => {
      this.loadChartsData();
    });
  }

  onYearChange(event: Event) {
    this.selectedYear = this.parseValue(event);
    this.loadChartsData();
  }

  resetFilters() {
    this.selectedUser = null;
    this.selectedPartner = null;
    this.selectedYear = null;
    this.loadFilterOptions().then(() => {
      this.loadChartsData();
    });
  }

  private parseValue(event: Event): number | null {
    const value = (event.target as HTMLSelectElement).value;
    return value ? +value : null;
  }
}