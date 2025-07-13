import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsersService } from 'src/app/core/services/user.service';
import { PartnersService } from 'src/app/core/services/partners.service';
import { Partner } from 'src/app/core/models/partner.models';
import { Role } from 'src/app/core/models/role.model';

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
  selectedFile?: File;

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
    private partnersService: PartnersService
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
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  loadUser(): void {
    this.usersService.getUserById(this.userId).subscribe(
      (user) => {
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

        // Si utilisateur a une image, afficher aperçu
        if (user.image) {
          this.previewUrl = this.usersService.getUserImageUrl(user);
        }
      },
      (error) => {
        Swal.fire('Error', 'Failed to load user data', 'error');
      }
    );
  }

  loadRoles(): void {
    this.usersService.getClientRoles().subscribe(
      roles => {
        this.clientRoles = roles;
        if (this.selectedUserType === 'client') this.roles = this.clientRoles;
      },
      error => console.error('Error loading client roles', error)
    );

    this.usersService.getWorkerRoles().subscribe(
      roles => {
        this.workerRoles = roles;
        if (this.selectedUserType === 'worker') this.roles = this.workerRoles;
      },
      error => console.error('Error loading worker roles', error)
    );
  }

  loadPartners(): void {
    this.partnersService.getAllPartners().subscribe(
      (partners) => (this.partners = partners),
      (error) => {
        Swal.fire('Error', 'Failed to load partners', 'error');
      }
    );
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
      return;
    }

    this.isSubmitting = true;
    const formValue = this.editUserForm.value;

    const updateUserDto = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      roleId: Number(formValue.roleId),
      partnerId: this.selectedUserType === 'client' 
        ? Number(formValue.partnerId) 
        : null,
      accountStatus: formValue.accountStatus,
      image: undefined as string | undefined,
    };

    if (this.selectedFile) {
      // Upload image avant mise à jour
      this.usersService.uploadImage(this.selectedFile).subscribe({
        next: (event) => {
          if (event.body) {
            updateUserDto.image = event.body.filename;
            this.updateUser(updateUserDto);
          }
        },
        error: () => {
          Swal.fire('Erreur', 'Erreur lors de l\'upload de l\'image', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      // Pas d'image, mise à jour directe
      this.updateUser(updateUserDto);
    }
  }

  private updateUser(dto: any): void {
    this.usersService.updateUserFull(this.userId, dto).subscribe({
      next: () => {
        Swal.fire('Succès', 'Utilisateur mis à jour avec succès', 'success');
        this.router.navigate(['/list-user']);
      },
      error: () => {
        Swal.fire('Erreur', 'Échec de la mise à jour', 'error');
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/list-user']);
  }
}
