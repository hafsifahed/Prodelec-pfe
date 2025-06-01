import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnersService } from '../../core/services/partners.service';
import { Partner } from '../../core/models/partner.models';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsersService } from 'src/app/core/services/user.service';
import { Role } from 'src/app/core/models/role.model'; // adapte selon ton modèle

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

  selectedUserType: 'client' | 'worker' = 'client';

  isSubmitting = false;

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
      username: formValue.email,
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      roleId: Number(formValue.roleId),
      partnerId: this.selectedUserType === 'client' ? Number(formValue.partnerId) : null
    };

    this.usersService.createUserBy(createUserDto).subscribe(
      () => {
        Swal.fire('Succès', 'Utilisateur ajouté avec succès', 'success');
        this.router.navigate(['/list-user']);
      },
      error => {
        console.error('Erreur ajout utilisateur', error);
        Swal.fire('Erreur', 'Échec de l\'ajout de l\'utilisateur', 'error');
        this.isSubmitting = false;
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/list-user']);
  }
}
