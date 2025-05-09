import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../core/services/users.service';
import { UserModel } from '../../core/models/user.models';
import Swal from 'sweetalert2';
import { Router } from "@angular/router";
import {WorkersService} from "../../core/services/workers.service";

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss']
})
export class ListUsersComponent implements OnInit {
  users: UserModel[] = [];
  searchKeyword: string = '';
  userr: any;
  userType: string | null = '';

  errorMessage = '';
  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Number of items per page

  constructor(private usersService: UsersService,
              private workersService: WorkersService,
              private router: Router) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userMail');

    if (this.userType && userEmail) {
      if (this.userType === 'user') {
        this.fetchUserProfile(userEmail);
      } else if (this.userType === 'worker') {
        this.fetchWorkerProfile(userEmail);
      } else {
        this.errorMessage = 'Invalid user type.';
      }
    } else {
      this.errorMessage = 'User information not found in local storage.';
    }
  }

  fetchUsers(): void {
    this.usersService.getAllUsers().subscribe(
        (users) => {
          this.users = users;
          console.log(users)
          console.log(this.users)
        },
        (error) => {
          console.error('Error fetching users', error);
          this.showErrorMessage('Error fetching users. Please try again later.');
        }
    );
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  editUser(user: UserModel): void {
    this.router.navigate(['/edit-user', user.id]);
  }

  deleteUser(user: UserModel): void {
    Swal.fire({
      title: 'Confirmation',
      text: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        // Delete the user
        this.usersService.deleteUser(user.id).subscribe(
            () => {
              Swal.fire({
                title: 'Deleted!',
                text: 'The user has been deleted successfully.',
                icon: 'success'
              });
              this.fetchUsers(); // Refresh the user list after deletion
            },
            (error) => {
              console.error('Error deleting user', error);
              Swal.fire({
                title: 'Error!',
                text: 'An error occurred while deleting the user.',
                icon: 'error'
              });
            }
        );
      }
    });
  }

  editUserPassword(user: UserModel): void {
    Swal.fire({
      title: 'Enter New Password',
      input: 'password',
      inputPlaceholder: 'Enter new password',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: (newPassword) => {
        // Call the service to update the user's password here
        this.usersService.updateUserPassword(user.id, newPassword).subscribe(
            () => {
              Swal.fire({
                title: 'Password Updated!',
                text: 'The password has been updated successfully.',
                icon: 'success'
              });
            },
            (error) => {
              console.error('Error updating password', error);
              Swal.fire({
                title: 'Error!',
                text: 'An error occurred while updating the password.',
                icon: 'error'
              });
            }
        );
      }
    });
  }

  navigateToAddUser(): void {
    this.router.navigate(['/add-user']);
  }



  searchUsers(): void {
    if (this.searchKeyword.trim() === '') {
      this.fetchUsers(); // Reload all users if search keyword is empty
    } else {
      this.users = this.users.filter(user =>
          user.firstName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          user.lastName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          user.role.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    }
  }

  onSearchInputChange(): void {
    this.searchUsers();
  }
  clearSearch(): void {
    this.searchKeyword = '';
    this.fetchUsers();
  }

  private fetchUserProfile(email: string): void {
    this.usersService.getUserByEmail(email).subscribe(
        (data) => {
          this.userr = data;
        },
        (error) => {
          console.error('Error fetching user data', error);
          this.errorMessage = 'Error fetching user data. Please try again later.';
        }
    );
  }

  private fetchWorkerProfile(email: string): void {
    this.workersService.getWorkerByEmail(email).subscribe(
        (data) => {
          this.userr = data;
        },
        (error) => {
          console.error('Error fetching worker data', error);
          this.errorMessage = 'Error fetching worker data. Please try again later.';
        }
    );
  }
}