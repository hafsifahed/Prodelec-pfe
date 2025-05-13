import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from "@angular/router";
import { User } from 'src/app/core/models/auth.models';
import { UsersService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss']
})
export class ListUsersComponent implements OnInit {
  users: User[] = [];
  searchKeyword: string = '';
  errorMessage = '';
  p: number = 1; // Current page number (for pagination)
  itemsPerPage: number = 5; // Number of items per page

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.usersService.findUsers({}).subscribe(
      (users) => {
        this.users = users;
        this.errorMessage = '';
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

  editUser(user: User): void {
    this.router.navigate(['/edit-user', user.id]);
  }

  deleteUser(user: User): void {
    Swal.fire({
      title: 'Confirmation',
      text: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersService.deleteUser(user.id).subscribe(
          () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The user has been deleted successfully.',
              icon: 'success'
            });
            this.fetchUsers(); // Refresh list after deletion
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

  editUserPassword(user: User): void {
    Swal.fire({
      title: 'Enter New Password',
      input: 'password',
      inputPlaceholder: 'Enter new password',
      inputAttributes: { autocapitalize: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: (newPassword: string) => {
        if (!newPassword || newPassword.length < 8) {
          Swal.showValidationMessage('Password must be at least 8 characters');
          return;
        }
        // Use setPassword method (admin reset) or changePassword (user change)
        // Assuming admin reset here:
        return this.usersService.setPassword(user.id, { newPassword }).toPromise()
          .catch(error => {
            Swal.showValidationMessage(`Request failed: ${error.message}`);
          });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Password Updated!',
          text: 'The password has been updated successfully.',
          icon: 'success'
        });
      }
    });
  }

  navigateToAddUser(): void {
    this.router.navigate(['/add-user']);
  }

  searchUsers(): void {
    const keyword = this.searchKeyword.trim();
    if (keyword === '') {
      this.fetchUsers(); // Reload all users if search is empty
    } else if (keyword.length >= 2) {
      this.usersService.searchUsers(keyword).subscribe(
        (users) => {
          this.users = users;
          this.errorMessage = '';
        },
        (error) => {
          console.error('Error searching users', error);
          this.showErrorMessage('Error searching users. Please try again later.');
        }
      );
    } else {
      this.showErrorMessage('Please enter at least 2 characters to search.');
    }
  }

  onSearchInputChange(): void {
    this.searchUsers();
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.fetchUsers();
  }
}
