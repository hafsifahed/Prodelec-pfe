import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsersService } from 'src/app/core/services/user.service';
import { PartnersService } from 'src/app/core/services/partners.service';
import { Partner } from 'src/app/core/models/partner.models';
import { Role } from 'src/app/core/models/role.model';
import { HttpEventType } from '@angular/common/http';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CropperDialogComponent } from '../setting/account-settings/cropper-dialog.component';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  editUserForm: FormGroup;
  userId: number;
  username: string;
  selectedUserType: 'client' | 'worker' = 'client';

  clientRoles: Role[] = [];
  workerRoles: Role[] = [];
  roles: Role[] = [];
  partners: Partner[] = [];
  isSubmitting = false;

  previewUrl: string | ArrayBuffer | null = null;
  imageFile?: File;
  modalRef?: BsModalRef;
  isUploading = false;
  uploadProgress = 0;
  currentImageUrl?: string;

  title = "Édition d'utilisateur";
  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: "Édition d'utilisateur", active: true }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private partnersService: PartnersService,
    private modalService: BsModalService
  ) {
    this.editUserForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roleId: [null, Validators.required],
      partnerId: [null],
      accountStatus: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id');
    this.loadPartners();
    this.loadRoles();
    this.loadUser();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.openCropperDialog(file);
    }
  }

  openCropperDialog(file: File): void {
    const initialState = {
      imageChangedEvent: { target: { files: [file] } }
    };

    this.modalRef = this.modalService.show(CropperDialogComponent, {
      initialState,
      class: 'modal-lg'
    });

    this.modalRef.content.onCrop.subscribe((croppedImage: Blob) => {
      this.handleCroppedImage(croppedImage);
    });
  }

  handleCroppedImage(croppedImage: Blob): void {
    this.imageFile = new File([croppedImage], 'user-profile.jpg', {
      type: croppedImage.type || 'image/jpeg'
    });

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
      this.currentImageUrl = undefined;
    };
    reader.readAsDataURL(this.imageFile);
  }

  removeImage(): void {
    this.previewUrl = this.currentImageUrl || null;
    this.imageFile = undefined;
  }

  loadUser(): void {
    this.usersService.getUserById(this.userId).subscribe({
      next: (user) => {
        const isClient = this.clientRoles.some(r => r.id === user.role.id);
        this.selectedUserType = isClient ? 'client' : 'worker';

        this.setRolesForSelectedType();
        this.updatePartnerValidators();

        this.editUserForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roleId: user.role.id,
          partnerId: user.partner?.id,
          accountStatus: user.accountStatus,
        });
        this.username = user.username;

        if (user.image) {
          this.currentImageUrl = this.usersService.getUserImageUrl(user);
          this.previewUrl = this.currentImageUrl;
        }
      },
      error: (error) => {
        console.error('Error loading user:', error);
        Swal.fire('Erreur', 'Échec du chargement des données utilisateur', 'error');
      }
    });
  }

  loadRoles(): void {
    this.usersService.getClientRoles().subscribe({
      next: (roles) => {
        this.clientRoles = roles;
        if (this.selectedUserType === 'client') this.roles = this.clientRoles;
      },
      error: (error) => console.error('Error loading client roles', error)
    });

    this.usersService.getWorkerRoles().subscribe({
      next: (roles) => {
        this.workerRoles = roles;
        if (this.selectedUserType === 'worker') this.roles = this.workerRoles;
      },
      error: (error) => console.error('Error loading worker roles', error)
    });
  }

  loadPartners(): void {
    this.partnersService.getAllPartners().subscribe({
      next: (partners) => this.partners = partners,
      error: (error) => {
        console.error('Error loading partners:', error);
        Swal.fire('Erreur', 'Échec du chargement des partenaires', 'error');
      }
    });
  }

  selectUserType(type: 'client' | 'worker'): void {
    this.selectedUserType = type;
    this.setRolesForSelectedType();
    this.updatePartnerValidators();
    this.editUserForm.get('roleId').setValue(null);
  }

  setRolesForSelectedType(): void {
    this.roles = this.selectedUserType === 'client' 
      ? this.clientRoles 
      : this.workerRoles;
  }

  updatePartnerValidators(): void {
    const partnerControl = this.editUserForm.get('partnerId');
    if (this.selectedUserType === 'client') {
      partnerControl.setValidators([Validators.required]);
    } else {
      partnerControl.clearValidators();
      partnerControl.setValue(null);
    }
    partnerControl.updateValueAndValidity();
  }

  submit(): void {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      Swal.fire('Erreur', 'Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.editUserForm.value;

    const updateUserDto: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      roleId: Number(formValue.roleId),
      accountStatus: formValue.accountStatus,
    };

    if (this.selectedUserType === 'client') {
      updateUserDto.partnerId = Number(formValue.partnerId);
    }

    if (this.imageFile) {
      this.uploadImage(updateUserDto);
    } else if (this.currentImageUrl) {
      updateUserDto.image = this.currentImageUrl.split('/').pop();
      this.updateUser(updateUserDto);
    } else {
      this.updateUser(updateUserDto);
    }
  }

  uploadImage(updateUserDto: any): void {
  if (!this.imageFile) {
    this.updateUser(updateUserDto);
    return;
  }

  this.isUploading = true;
  this.uploadProgress = 0;

  this.usersService.uploadImage(this.imageFile).subscribe({
    next: (response: { progress: number; body?: any }) => {
      this.uploadProgress = response.progress;

      if (response.progress === 100 && response.body) {
        updateUserDto.image = response.body.filename || response.body.url;
        this.updateUser(updateUserDto);
      }
    },
    error: (error) => {
      console.error('Upload error:', error);
      this.isUploading = false;
      this.uploadProgress = 0;
      Swal.fire('Erreur', 'Échec de l\'upload de l\'image', 'error');
    }
  });
}

  private updateUser(dto: any): void {
    this.usersService.updateUserFull(this.userId, dto).subscribe({
      next: () => {
        Swal.fire('Succès', 'Utilisateur mis à jour avec succès', 'success')
          .then(() => {
            if (this.selectedUserType === 'client') {
              this.router.navigate(['/list-user']);
            } else {
              this.router.navigate(['/list-worker']);
            }
          });
      },
      error: (error) => {
        console.error('Update error:', error);
        this.isSubmitting = false;
        this.isUploading = false;
        Swal.fire('Erreur', 'Échec de la mise à jour de l\'utilisateur', 'error');
      },
      complete: () => {
        this.isSubmitting = false;
        this.isUploading = false;
      }
    });
  }

  cancel(): void {
    if (this.selectedUserType === 'client') {
      this.router.navigate(['/list-user']);
    } else {
      this.router.navigate(['/list-worker']);
    }
  }
}