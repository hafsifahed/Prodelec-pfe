import { Component, OnInit } from '@angular/core';
import { Setting, SettingService } from 'src/app/core/services/setting.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  settings: Setting[] = [];
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

  onFieldChange(setting: Setting, field: keyof Setting, event: Event) {
    const input = event.target as HTMLInputElement;
    let value: number | null = null;

    // Convertir la valeur en nombre, ou null si vide ou invalide
    if (input.value.trim() === '') {
      value = null;
    } else {
      const parsed = Number(input.value);
      value = isNaN(parsed) ? null : parsed;
    }

    // Mise à jour locale immédiate
    setting[field] = value;

    if (setting.id) {
      this.settingService.updateSetting(setting.id, { [field]: value }).subscribe({
        next: updated => Object.assign(setting, updated),
        error: () => this.error = 'Erreur lors de la mise à jour'
      });
    }
  }
}
