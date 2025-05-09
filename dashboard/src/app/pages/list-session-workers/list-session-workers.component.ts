import {Component, OnInit} from '@angular/core';
import { UserSessionModels } from '../../core/models/user-session.models';
import { WorkerSessionService } from '../../core/services/worker-session.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import {WorkerSessionModels} from "../../core/models/worker-session.models";
import {WorkersService} from "../../core/services/workers.service";
import {UsersService} from "../../core/services/users.service";


@Component({
  selector: 'app-list-session-workers',
  templateUrl: './list-session-workers.component.html',
  styleUrls: ['./list-session-workers.component.scss']
})
export class ListSessionWorkersComponent implements OnInit{
  workerSessions: WorkerSessionModels[] = [];
  errorMessage = '';
  searchWorkermail: string = '';
  user: any;
  userType: string | null = '';

  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Number of items per page

  constructor(private workerSessionService: WorkerSessionService,
              private usersService: UsersService,
              private workersService: WorkersService) {
  }
  ngOnInit(): void {
    this.loadUserSessions();
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

  loadUserSessions(): void {
    this.workerSessionService.getAllWorkerSessions()
        .subscribe(
            userSessions => {
              // Sort the sessions based on the sessionEnd property
              this.workerSessions = userSessions.sort((a, b) => {
                if (a.sessionEnd === null && b.sessionEnd === null) {
                  return 0; // If both sessionEnd are null, maintain original order
                } else if (a.sessionEnd === null) {
                  return -1; // If a's sessionEnd is null, move it to the beginning
                } else if (b.sessionEnd === null) {
                  return 1; // If b's sessionEnd is null, move it to the beginning
                } else {
                  return 0; // If both sessionEnd are not null, maintain original order
                }
              });
            },
            error => {
              console.error('Error loading user sessions', error);
              this.showErrorMessage('Error loading user sessions. Please try again later.');
            }
        );
  }

  endSession(userSessionId: string): void {
    Swal.fire({
      title: 'End Session',
      text: 'Are you sure you want to end this session?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, end it!',
      cancelButtonText: 'No, keep it'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.workerSessionService.endSession(Number(userSessionId))
            .subscribe(
                () => {
                  Swal.fire('Session Ended!', 'The session has been ended.', 'success');
                  this.loadUserSessions();
                },
                error => {
                  console.error('Error ending session', error);
                  this.showErrorMessage('Error ending session. Please try again later.');
                }
            );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'The session was not ended.', 'error');
      }
    });
  }

  private showSuccessMessage(message: string): void {
    alert(message);
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  searchWorkerSessionsByUsermail(): void {
    if (this.searchWorkermail.trim() === '') {
      this.loadUserSessions();
    } else {
      this.workerSessions = this.workerSessions.filter(session =>
          session.workermail.toLowerCase().includes(this.searchWorkermail.toLowerCase())
      );
    }
  }

  onWorkermailSearchInputChange(): void {
    this.searchWorkerSessionsByUsermail();
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