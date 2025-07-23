import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Setting } from 'src/app/core/services/setting.service';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent {
  @Input() settings!: Setting;
  @Output() settingsUpdate = new EventEmitter<Partial<Setting>>();

  notificationTypes = [
    { id: 'email', label: 'Email' },
    { id: 'push', label: 'Notification push' },
    { id: 'sms', label: 'SMS' }
  ];

  frequencies = [
    { id: 'immediate', label: 'Immédiatement' },
    { id: 'daily', label: 'Quotidiennement' },
    { id: 'weekly', label: 'Hebdomadairement' }
  ];

  updateNotificationPreference(type: string, enabled: boolean) {
    const updatedPrefs = { ...this.settings.notificationPreferences, [type]: enabled };
    this.settingsUpdate.emit({ notificationPreferences: updatedPrefs });
  }

  updateFrequency(frequency: string) {
    this.settingsUpdate.emit({ notificationFrequency: frequency });
  }
}