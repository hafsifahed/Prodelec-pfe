import { Component, OnInit } from '@angular/core';
import { Setting, SettingService } from 'src/app/core/services/setting.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  settings: Setting | null = null; // objet unique ou null
  loading = false;
  error = '';

  constructor(private settingService: SettingService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings() {
    this.loading = true;
    this.settingService.getSettings().subscribe({
      next: data => {
        this.settings = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des paramètres';
        this.loading = false;
      }
    });
  }

  onFieldChange(field: keyof Setting, event: Event) {
    if (!this.settings) return;
    const input = event.target as HTMLInputElement;
    let value: number | null = null;

    if (input.value.trim() === '') {
      value = null;
    } else {
      const parsed = Number(input.value);
      value = isNaN(parsed) ? null : parsed;
    }

    // Mise à jour locale immédiate
    this.settings[field] = value;

    if (this.settings.id) {
      this.settingService.updateSetting(this.settings.id, { [field]: value }).subscribe({
        next: updated => Object.assign(this.settings, updated),
        error: () => this.error = 'Erreur lors de la mise à jour'
      });
    }
  }
}
