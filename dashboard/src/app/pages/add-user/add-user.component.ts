import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnersService } from '../../core/services/partners.service';
import { Partner } from '../../core/models/partner.models';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsersService } from 'src/app/core/services/user.service';
import { Role } from 'src/app/core/models/role.model';

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

  title = 'Ajouter un Utilisateur';

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Ajouter un Utilisateur', active: true }
  ];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private partnersService: PartnersService,
    private router: Router
  ) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      roleId: [null, Validators.required],
      partnerId: [null] // validation dynamique selon userType
    });
  }

  ngOnInit(): void {
    this.loadPartners();
    this.loadRoles();
    this.setRolesForSelectedType();
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

  loadPartners(): void {
    this.partnersService.getAllPartners().subscribe(
      partners => this.partners = partners,
      error => {
        console.error('Erreur chargement partenaires', error);
        Swal.fire('Erreur', 'Impossible de charger les partenaires', 'error');
      }
    );
  }

  loadRoles(): void {
    this.usersService.getClientRoles().subscribe(
      roles => {
        this.clientRoles = roles;
        if (this.selectedUserType === 'client') this.roles = this.clientRoles;
      },
      error => console.error('Erreur chargement rôles clients', error)
    );

    this.usersService.getWorkerRoles().subscribe(
      roles => {
        this.workerRoles = roles;
        if (this.selectedUserType === 'worker') this.roles = this.workerRoles;
      },
      error => console.error('Erreur chargement rôles employés', error)
    );
  }

  selectUserType(type: 'client' | 'worker'): void {
    this.selectedUserType = type;
    this.setRolesForSelectedType();
    this.addUserForm.get('roleId').setValue(null);

    const partnerControl = this.addUserForm.get('partnerId');
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

  submit(): void {
  if (this.addUserForm.invalid) {
    this.addUserForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;
  const formValue = this.addUserForm.value;

  const createUserDto = {
    username: formValue.email.split('@')[0],
    email: formValue.email,
    password: formValue.password,
    firstName: formValue.firstName,
    lastName: formValue.lastName,
    roleId: Number(formValue.roleId),
    partnerId: this.selectedUserType === 'client' ? Number(formValue.partnerId) : null,
    image: undefined as string | undefined,
  };

  if (this.selectedFile) {
    this.usersService.uploadImage(this.selectedFile).subscribe({
      next: (event) => {
        if (event.body) {
          createUserDto.image = event.body.filename;
          console.log('DTO avec image:', createUserDto); // Vérifiez ici
          this.createUser(createUserDto);
        }
      },
      error: () => {
        Swal.fire('Erreur', 'Erreur lors de l\'upload de l\'image', 'error');
        this.isSubmitting = false;
      }
    });
  } else {
    this.createUser(createUserDto);
  }
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
