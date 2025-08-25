import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Setting } from 'src/app/core/services/setting.service';

@Component({
  selector: 'app-reclamation-settings',
  templateUrl: './reclamation-settings.component.html',
  styleUrls: ['./reclamation-settings.component.scss']
})
export class ReclamationSettingsComponent {
  @Input() settings!: Setting;
  @Output() settingsUpdate = new EventEmitter<Partial<Setting>>();

  emailFields: (keyof Setting)[] = [
    'reclamationEmails',
    'avisEmails',
    'devisEmails',
    'cahierDesChargesEmails',
    'globalEmails'
  ];

  addingEmailField: keyof Setting | null = null;
  newEmailValue = '';
  error = '';

  updateNumberField(field: keyof Setting, value: string) {
    const numericValue = value ? +value : null;
    this.settingsUpdate.emit({ [field]: numericValue });
  }

  startAddingEmail(field: keyof Setting) {
    this.addingEmailField = field;
    this.newEmailValue = '';
    this.error = '';
  }

  cancelAddingEmail() {
    this.addingEmailField = null;
    this.newEmailValue = '';
    this.error = '';
  }

  addEmail(field: keyof Setting, inputElement: HTMLInputElement) {
    const email = this.newEmailValue.trim();

    if (!inputElement.checkValidity()) {
      this.error = 'Email invalide';
      return;
    }

    const currentEmails = [...(this.settings[field] as string[]) || []];

    if (currentEmails.includes(email)) {
      this.error = 'Email déjà présent dans la liste';
      return;
    }

    const updatedEmails = [...currentEmails, email];
    this.settingsUpdate.emit({ [field]: updatedEmails });
    this.cancelAddingEmail();
  }

  removeEmail(field: keyof Setting, emailToRemove: string) {
    const currentEmails = [...(this.settings[field] as string[]) || []];
    const updatedEmails = currentEmails.filter(e => e !== emailToRemove);
    this.settingsUpdate.emit({ [field]: updatedEmails });
  }

  formatFieldLabel(field: string): string {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
}
