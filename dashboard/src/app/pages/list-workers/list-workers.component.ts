import { Component, OnInit } from '@angular/core';
import { WorkersService } from '../../core/services/workers.service';
import { WorkerModel } from '../../core/models/worker.models';
import Swal from 'sweetalert2';
import { Router } from "@angular/router";
import {UsersService} from "../../core/services/users.service";

@Component({
  selector: 'app-list-workers',
  templateUrl: './list-workers.component.html',
  styleUrls: ['./list-workers.component.scss']
})
export class ListWorkersComponent implements OnInit {
  workers: WorkerModel[] = [];
  errorMessage = '';
  searchKeyword: string = '';
  user: any;
  userType: string | null = '';

  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Number of items per page

  constructor(private workersService: WorkersService,
              private usersService: UsersService,
              private router: Router) {}

  ngOnInit(): void {
    this.fetchWorkers();
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

  fetchWorkers(): void {
    this.workersService.getAllWorkers().subscribe(
        (workers) => {
          this.workers = workers;
        },
        (error) => {
          console.error('Error fetching workers', error);
          this.showErrorMessage('Error fetching workers. Please try again later.');
        }
    );
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  editWorker(worker: WorkerModel): void {
    this.router.navigate(['/edit-worker', worker.id]);
  }

  deleteWorker(worker: WorkerModel): void {
    Swal.fire({
      title: 'Confirmation',
      text: `Are you sure you want to delete ${worker.firstName} ${worker.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        // Delete the worker
        this.workersService.deleteWorker(worker.id).subscribe(
            () => {
              Swal.fire({
                title: 'Deleted!',
                text: 'The worker has been deleted successfully.',
                icon: 'success'
              });
              this.fetchWorkers();
            },
            (error) => {
              console.error('Error deleting worker', error);
              Swal.fire({
                title: 'Error!',
                text: 'An error occurred while deleting the worker.',
                icon: 'error'
              });
            }
        );
      }
    });
  }

  editWorkerPassword(worker: WorkerModel): void {
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
        // Call the service to update the worker's password here
        this.workersService.updateWorkerPassword(worker.id, newPassword).subscribe(
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

  navigateToAddWorker(): void {
    this.router.navigate(['/add-worker']);
  }

  searchWorkers(): void {
    if (this.searchKeyword.trim() === '') {
      this.fetchWorkers();
    } else {
      this.workers = this.workers.filter(worker =>
          worker.firstName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          worker.lastName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          worker.email.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          worker.role.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    }
  }

  onSearchInputChange(): void {
    this.searchWorkers();
  }
  clearSearch(): void {
    this.searchKeyword = '';
    this.fetchWorkers();
  }

  private fetchUserProfile(email: string): void {
    this.usersService.getUserByEmail(email).subscribe(
        (data) => {
          this.user = data;
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
          this.user = data;
        },
        (error) => {
          console.error('Error fetching worker data', error);
          this.errorMessage = 'Error fetching worker data. Please try again later.';
        }
    );
  }
}