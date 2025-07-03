import { Component, OnInit } from '@angular/core';
import { Setting, SettingService } from 'src/app/core/services/setting.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  settings: Setting | null = null;
  loading = false;
  error = '';
  title = 'Settings';

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Settings', active: true }
  ];

  emailFields: string[] = [
    'reclamationEmails',
    'avisEmails',
    'devisEmails',
    'cahierDesChargesEmails',
    'globalEmails'
  ];

  addingEmailField: string | null = null;
  newEmailValue = '';

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

  onNumberFieldChange(field: keyof Pick<Setting, 'reclamationTarget'>, event: Event) {
    if (!this.settings) return;
    const input = event.target as HTMLInputElement;
    let value: number | null = null;

    if (input.value.trim() === '') {
      value = null;
    } else {
      const parsed = Number(input.value);
      value = isNaN(parsed) ? null : parsed;
    }

    this.settings[field] = value as any;

    if (this.settings.id) {
      this.settingService.updateSetting(this.settings.id, { [field]: value }).subscribe({
        next: updated => Object.assign(this.settings, updated),
        error: () => (this.error = 'Erreur lors de la mise à jour')
      });
    }
  }

  startAddingEmail(field: string) {
    this.addingEmailField = field;
    this.newEmailValue = '';
    this.error = '';
  }

  cancelAddingEmail() {
    this.addingEmailField = null;
    this.newEmailValue = '';
    this.error = '';
  }

  addEmail(field: string, inputElement: HTMLInputElement) {
    if (!this.settings) return;

    const email = this.newEmailValue.trim();

    if (!inputElement.checkValidity()) {
      this.error = 'Email invalide';
      return;
    }

    if (!Array.isArray(this.settings[field as keyof Setting])) {
      this.settings[field as keyof Setting] = [] as any;
    }

    const emails = this.settings[field as keyof Setting] as string[];

    if (emails.includes(email)) {
      this.error = 'Email déjà présent dans la liste';
      return;
    }

    emails.push(email);
    this.updateEmails(field, emails);
    this.cancelAddingEmail();
  }

  removeEmail(field: string, emailToRemove: string) {
    if (!this.settings || !Array.isArray(this.settings[field as keyof Setting])) return;

    const emails = (this.settings[field as keyof Setting] as string[]).filter(e => e !== emailToRemove);
    this.updateEmails(field, emails);
  }

  private updateEmails(field: string, emails: string[]) {
    if (!this.settings?.id) return;

    this.settingService.updateSetting(this.settings.id, { [field]: emails }).subscribe({
      next: updated => {
        Object.assign(this.settings, updated);
        this.error = '';
      },
      error: () => {
        this.error = 'Erreur lors de la mise à jour';
      }
    });
  }

  // Méthode pour formater les noms des champs (ex: "reclamationEmails" => "Reclamation Emails")
  formatFieldLabel(field: string): string {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
}
