import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/core/models/auth.models';
import { TitleService } from 'src/app/core/services/title.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Tableau de bord', active: true }
  ];

  user: User | null = null;
  roleName: string | null = null;
  activeTab: string = 'cards'; // Onglet actif par défaut

  // Configuration des onglets
  tabs = [
    { id: 'cards', label: 'Vue Générale', icon: 'grid' },
    { id: 'charts', label: 'Statistiques', icon: 'bar-chart' }
  ];

  constructor(
    private userStateService: UserStateService,
    private titleService: TitleService
  ) {}

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
      this.user = user;
      this.roleName = user?.role?.name ?? null;
      console.log('Role détecté:', this.roleName);
    });
  }

  isClientRole(): boolean {
    return this.roleName?.toUpperCase().startsWith('CLIENT') ?? false;
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }
}