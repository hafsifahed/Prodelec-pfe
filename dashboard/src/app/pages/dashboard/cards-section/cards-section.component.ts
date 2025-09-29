// cards-section.component.ts
import { Component, OnInit } from '@angular/core';
import { StatisticsService, GlobalStats, PeriodStats } from 'src/app/core/services/statistics.service';
import { AvisService } from 'src/app/core/services/avis.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { SettingService } from 'src/app/core/services/setting.service';

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

  constructor(
    private statsSrv: StatisticsService,
    private avisSrv: AvisService,
    private projectSrv: ProjectService,
    private settingService: SettingService
  ) { }

  async ngOnInit() {
    // Charger la configuration
    this.settingService.getSettings().subscribe((res: any) => {
      this.setting = res;
    });

    // Charger les données initiales
    await this.loadStats();
  }

  // Charger les statistiques
  private async loadStats() {
    this.isLoading = true;
    
    try {
      const [globalStats, comparativeStats] = await Promise.all([
        this.statsSrv.getGlobalStats(this.selectedPeriod).toPromise(),
        this.statsSrv.getComparativeStats(this.selectedPeriod).toPromise()
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

  // Changer la période
  onPeriodChange(period: string) {
    this.selectedPeriod = period;
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
      'year': 'Cette année'
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
}