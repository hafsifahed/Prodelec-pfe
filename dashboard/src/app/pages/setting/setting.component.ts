import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/core/services/user.service';
import { SettingService } from 'src/app/core/services/setting.service';
import { User } from 'src/app/core/models/auth.models';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  user: User | null = null;  // Changé de settings à user pour plus de clarté
  loading = false;
  error = '';
  title = 'Paramètres Utilisateur';
  activeTab: string = 'account';

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Paramètres', active: true }
  ];

  tabs = [
    { id: 'account', label: 'Compte', icon: 'person' },
    { id: 'security', label: 'Sécurité', icon: 'shield-lock' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'reclamations', label: 'Réclamations', icon: 'exclamation-circle' }
  ];

  constructor(
    private settingService: SettingService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    this.error = '';
  }

  loadUserProfile() {
    this.loading = true;
    this.usersService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du profil';
        this.loading = false;
        console.error('Erreur:', err);
      }
    });
  }

  handleSettingsUpdate(updatedSettings: Partial<User>) {
    if (!this.user?.id) return;

    this.loading = true;
    this.usersService.updateUser(this.user.id, updatedSettings).subscribe({
      next: (updatedUser) => {
        this.user = { ...this.user, ...updatedUser };
        this.loading = false;
        this.error = '';
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la mise à jour';
        this.loading = false;
      }
    });
  }
}