import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsersService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  editUserForm: FormGroup;
  userId: number;
  roles: string[] = ['CLIENTADMIN', 'CLIENTUSER'];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService
  ) {
    this.editUserForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roleId: ['', Validators.required],
      // password is not editable here, manage separately if needed
    });
  }

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id');
    this.loadUser();
  }

  loadUser(): void {
    this.usersService.getUserById(this.userId).subscribe(
      (user) => {
        this.editUserForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roleId: user.role?.id || user.role, // adapt if role is object or string
        });
      },
      (error) => {
        Swal.fire('Error', 'Failed to load user data', 'error');
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

    this.usersService.updateUser(this.userId, updateUserDto).subscribe(
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
