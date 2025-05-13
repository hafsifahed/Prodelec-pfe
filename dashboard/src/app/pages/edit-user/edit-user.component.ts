import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsersService } from 'src/app/core/services/user.service';
import { PartnersService } from 'src/app/core/services/partners.service';
import { Partner } from 'src/app/core/models/partner.models';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  editUserForm: FormGroup;
  userId: number;
  username: string;

  roles = [
    { id: 1, name: 'CLIENTADMIN' },
    { id: 2, name: 'CLIENTUSER' }
  ];
  isSubmitting = false;
  partners: Partner[] = [];

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
      roleId: ['', Validators.required],
      partnerId: ['', Validators.required],
      accountStatus: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id');
    this.loadUser();
    this.loadPartners();

  }

  loadUser(): void {
    this.usersService.getUserById(this.userId).subscribe(
      (user) => {
        this.editUserForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roleId: user.role?.id || user.role,
          partnerId: user.partner?.id, // uncomment if partnerId is managed
          accountStatus: user.accountStatus, // uncomment if accountStatus is managed
        });
        this.username=user.username;
      },
      (error) => {
        Swal.fire('Error', 'Failed to load user data', 'error');
      }
    );
  }
  loadPartners(): void {
    this.partnersService.getAllPartners().subscribe(
      (partners) => (this.partners = partners),
      (error) => {
        console.error('Error loading partners', error);
        Swal.fire('Error', 'Failed to load partners', 'error');
      }
    );
  }

  submit(): void {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const updateUserDto = this.editUserForm.value;

    // Convert roleId (and partnerId if added) to number explicitly
    updateUserDto.roleId = Number(updateUserDto.roleId);
    updateUserDto.partnerId = Number(updateUserDto.partnerId); 

    this.usersService.updateUserFull(this.userId, updateUserDto).subscribe(
      () => {
        Swal.fire('Success', 'User updated successfully', 'success');
        this.router.navigate(['/list-user']);
      },
      (error) => {
        Swal.fire('Error', 'Failed to update user', 'error');
        this.isSubmitting = false;
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/list-user']);
  }
}
