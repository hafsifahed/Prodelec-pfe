import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss']
})
export class SecuritySettingsComponent {
  @Input() settings!: any;
  @Output() settingsUpdate = new EventEmitter<Partial<any>>();
  modalRef?: BsModalRef;
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private modalService: BsModalService,
    private usersService: UsersService,
    private toastService: ToastrService
  ) {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  updateField(field: string, value: any) {
    this.settingsUpdate.emit({ [field]: value });
  }

  changePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toastService.error('Les mots de passe ne correspondent pas');
      return;
    }

    this.usersService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.toastService.success('Mot de passe modifié avec succès');
        this.modalRef?.hide();
        this.resetPasswordForm();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erreur lors du changement de mot de passe');
      }
    });
  }

  private resetPasswordForm() {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  toggleTwoFactorAuth(enabled: boolean) {
   /* this.usersService.updateUser(this.settings.id, { twoFactorEnabled: enabled }).subscribe({
      next: () => {
        this.updateField('twoFactorEnabled', enabled);
        this.toastService.success(`2FA ${enabled ? 'activée' : 'désactivée'}`);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erreur lors de la mise à jour');
      }
    });*/
  }
}