import { Component, OnInit } from '@angular/core';
import { StatisticsService, GlobalStats } from 'src/app/core/services/statistics.service';
import { AvisService } from 'src/app/core/services/avis.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { SettingService } from 'src/app/core/services/setting.service';
@Component({
  selector: 'app-cards-section',
  templateUrl: './cards-section.component.html',
  styleUrls: ['./cards-section.component.scss']
})
export class CardsSectionComponent implements OnInit {
  stats = {
    totalEmployees: 0,
    connectedEmployees: 0,
    totalClients: 0,
    connectedClients: 0,
  };

  statData = [
    { icon: 'bx bx-copy-alt', title: 'Commandes', value: '0' },
    { icon: 'bx bx-copy-alt', title: 'Projets', value: '0' },
    { icon: 'bx bx-error-circle', title: 'Commandes annulées', value: '0' },
    { icon: 'bx bx-check-circle', title: 'Projets terminés', value: '0' },
    { icon: 'bx bx-error-circle', title: 'Projet retards', value: '0' },
  ];

  reclamationPercentage = 0;
  setting: any;
  projectsCompleted: any[] = [];
  avisList: any[] = [];
  avgTotal = 0;

  constructor(
    private statsSrv: StatisticsService,
    private avisSrv: AvisService,
    private projectSrv: ProjectService,
    private settingService: SettingService
  ) { }

  async ngOnInit() {
    this.settingService.getSettings().subscribe((res: any) => {
      this.setting = res;
    });

    this.statsSrv.getGlobalStats().subscribe({
      next: (g: GlobalStats) => {
        this.statData[0].value = g.totalOrders.toString();
        this.statData[1].value = g.totalProjects.toString();
        this.statData[2].value = g.cancelledOrders.toString();
        this.statData[3].value = g.completedProjects.toString();
        this.statData[4].value = g.lateProjects.toString();
        this.stats = g.sessions;
        this.reclamationPercentage = +g.reclamationRatio.toFixed(2);
      },
      error: err => console.error('[Dashboard] getGlobalStats KO', err),
    });

    await this.loadAvis();
    await this.loadProjectsCompleted();
  }

  private async loadAvis() {
    this.avisList = await this.avisSrv.getAllAvis().toPromise();
    this.avgTotal = this.avisList.length
      ? +(this.avisList.reduce((s, a) => s + (a.avg ?? 0), 0) / this.avisList.length).toFixed(2)
      : 0;
  }

  private async loadProjectsCompleted() {
    const projects = await this.projectSrv.getAllProjects().toPromise();
    this.projectsCompleted = projects.filter(p => p.progress === 100);
  }
}
