import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnersService } from '../../core/services/partners.service';
import { Partner, PartnerStatus } from '../../core/models/partner.models';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsersService } from 'src/app/core/services/user.service';
import { Role } from 'src/app/core/models/role.model';
import { map } from 'rxjs/operators';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CropperDialogComponent } from '../setting/account-settings/cropper-dialog.component';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  addUserForm: FormGroup;
  partners: Partner[] = [];
  clientRoles: Role[] = [];
  workerRoles: Role[] = [];
  roles: Role[] = [];
  previewUrl: string | ArrayBuffer | null = null;

  selectedUserType: 'client' | 'worker' = 'client';
  selectedFile?: File;

  isSubmitting = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';

  modalRef?: BsModalRef;

  title = 'Ajouter un Utilisateur';

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Ajouter un Utilisateur', active: true }
  ];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private partnersService: PartnersService,
    private router: Router,
    private modalService: BsModalService
  ) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      roleId: [null, Validators.required],
      partnerId: [null] // valide dynamiquement si client
    });
  }

  ngOnInit(): void {
    this.loadPartners();
    this.loadRoles();
    this.setRolesForSelectedType();
  }

  loadPartners(): void {
    this.partnersService.getAllPartners()
      .pipe(
        map(partners => partners.filter(p => p.partnerStatus === PartnerStatus.ACTIVE))
      )
      .subscribe({
        next: activePartners => this.partners = activePartners,
        error: error => {
          console.error('Erreur chargement partenaires', error);
          Swal.fire('Erreur', 'Impossible de charger les partenaires actifs', 'error');
        }
      });
  }

  loadRoles(): void {
    this.usersService.getClientRoles().subscribe(
      roles => {
        this.clientRoles = roles;
        if (this.selectedUserType === 'client') this.roles = this.clientRoles;
      },
      err => console.error('Erreur chargement rôles clients', err)
    );

    this.usersService.getWorkerRoles().subscribe(
      roles => {
        this.workerRoles = roles;
        if (this.selectedUserType === 'worker') this.roles = this.workerRoles;
      },
      err => console.error('Erreur chargement rôles employés', err)
    );
  }

  selectUserType(type: 'client' | 'worker'): void {
    this.selectedUserType = type;
    this.setRolesForSelectedType();
    this.addUserForm.get('roleId')!.setValue(null);

    const partnerControl = this.addUserForm.get('partnerId')!;
    if (type === 'client') {
      partnerControl.setValidators([Validators.required]);
    } else {
      partnerControl.clearValidators();
      partnerControl.setValue(null);
    }
    partnerControl.updateValueAndValidity();
  }

  setRolesForSelectedType(): void {
    this.roles = this.selectedUserType === 'client' ? this.clientRoles : this.workerRoles;
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
    this.selectedFile = new File([croppedImage], 'user-image.jpg', { type: croppedImage.type || 'image/jpeg' });
    const reader = new FileReader();
    reader.onload = () => { this.previewUrl = reader.result; };
    reader.readAsDataURL(this.selectedFile);
  }

  submit(): void {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }
    if (this.isSubmitting || this.isUploading) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.addUserForm.value;
    const createUserDto: any = {
      username: formValue.email.split('@')[0],
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      roleId: Number(formValue.roleId),
      partnerId: this.selectedUserType === 'client' ? Number(formValue.partnerId) : null,
      image: undefined
    };

    if (this.selectedFile) {
      this.uploadImageAndCreateUser(createUserDto);
    } else {
      this.createUser(createUserDto);
    }
  }

  uploadImageAndCreateUser(dto: any): void {
    this.isUploading = true;
    this.uploadProgress = 0;

    this.usersService.uploadImage(this.selectedFile!).subscribe({
      next: (event: any) => {
        if (event.progress === undefined) return;

        this.uploadProgress = event.progress;

        if (event.progress === 100 && event.body) {
          dto.image = event.body.filename || event.body.url;
          this.isUploading = false;
          this.createUser(dto);
        }
      },
      error: () => {
        Swal.fire('Erreur', 'Erreur lors de l\'upload de l\'image', 'error');
        this.isUploading = false;
        this.isSubmitting = false;
      }
    });
  }

  private createUser(dto: any): void {
    this.usersService.createUserBy(dto).subscribe({
      next: () => {
        Swal.fire('Succès', 'Utilisateur ajouté avec succès', 'success');
        this.router.navigate(['/list-user']);
      },
      error: (err) => {
        console.error('Erreur ajout utilisateur', err);
        Swal.fire('Erreur', 'Échec de l\'ajout de l\'utilisateur', 'error');
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/list-user']);
  }
}
