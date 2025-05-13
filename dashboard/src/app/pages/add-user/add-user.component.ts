import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartnersService } from '../../core/services/partners.service';
import { Partner } from '../../core/models/partner.models';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsersService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  addUserForm: FormGroup;
  errorMessage = '';
  partners: Partner[] = [];
  roles = [
    { id: 1, name: 'CLIENTADMIN' },
    { id: 2, name: 'CLIENTUSER' }
  ];
   // Adjust roles as needed
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
      roleId: [0, Validators.required],
      partnerId: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPartners();
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
      roleId: Number(formValue.roleId),     // convert to number
      partnerId: Number(formValue.partnerId) // convert to number
    };
  
    this.usersService.createUserBy(createUserDto).subscribe(
      () => {
        Swal.fire('Success', 'User added successfully', 'success');
        this.router.navigate(['/list-user']);
      },
      (error) => {
        console.error('Error adding user', error);
        Swal.fire('Error', 'Failed to add user', 'error');
        this.isSubmitting = false;
      }
    );
  }
  

  cancel(): void {
    this.router.navigate(['/list-user']);
  }
}
