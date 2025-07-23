import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from 'src/app/core/services/user.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { User } from 'src/app/core/models/auth.models';
import { ToastrService } from 'ngx-toastr';
import { CropperDialogComponent } from './cropper-dialog.component';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent {
  @Input() settings!: User;
  @Output() settingsUpdate = new EventEmitter<Partial<User>>();
  modalRef?: BsModalRef;
  isUploading = false;
  uploadProgress = 0;
  accountForm: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private toastService: ToastrService,
    private modalService: BsModalService
  ) {
    this.accountForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
    });
  }

  ngOnInit() {
    if (this.settings) {
      this.accountForm.patchValue({
        firstName: this.settings.firstName,
        lastName: this.settings.lastName,
        email: this.settings.email,
      });
      if (this.settings.image) {
        this.previewUrl = this.usersService.getUserImageUrl(this.settings);
      }
    }
  }

  updateField(field: keyof User, value: any) {
    const update = { [field]: value };
    this.usersService.updateUser(this.settings.id, update).subscribe({
      next: (updatedUser) => {
        this.settingsUpdate.emit(update);
        this.toastService.success('Modifications enregistrées');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erreur lors de la mise à jour');
      }
    });
  }

  onSubmit() {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    const formData = this.accountForm.value;
    if (!formData.password) {
      delete formData.password;
    }

    this.usersService.updateUser(this.settings.id, formData).subscribe({
      next: (updatedUser) => {
        this.settingsUpdate.emit(formData);
        this.toastService.success('Profil mis à jour avec succès');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erreur lors de la mise à jour');
      }
    });
  }

  openImageCropper(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const imageChangedEvent = {
        target: {
          files: [file]
        }
      };

      this.modalRef = this.modalService.show(CropperDialogComponent, {
        initialState: { imageChangedEvent },
        class: 'modal-lg'
      });

      this.modalRef.content.onCrop.subscribe((croppedImage: Blob) => {
        this.uploadImage(croppedImage);
      });
    }
  }

  uploadImage(croppedImage: Blob) {
    this.isUploading = true;
    this.uploadProgress = 0;
    
    const file = new File([croppedImage], 'profile.jpg', { 
      type: croppedImage.type || 'image/jpeg' 
    });

    this.usersService.uploadImage(file).subscribe({
      next: (event: any) => {
        if (event.progress) {
          this.uploadProgress = event.progress;
        }
        
        if (event.body) {
          this.settings.image = event.body.filename;
          this.previewUrl = this.usersService.getUserImageUrl(this.settings);
          this.updateField('image', event.body.filename);
          this.isUploading = false;
          this.toastService.success('Photo de profil mise à jour');
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erreur lors du téléchargement');
        this.isUploading = false;
      }
    });
  }

  getImageUrl(): string {
    return this.usersService.getUserImageUrl(this.settings);
  }

  getAccountStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'suspended': 'Suspendu'
    };
    return statusMap[status] || status;
  }

  canChangeStatus(): boolean {
    return false;
  }
}