import { Component, OnInit } from '@angular/core';
import { UserSessionModels } from '../../core/models/user-session.models';
import { WorkerSessionService } from '../../core/services/worker-session.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import {UserSessionService} from "../../core/services/user-session.service";
import {WorkersService} from "../../core/services/workers.service";
import {UsersService} from "../../core/services/users.service";
import { UserStateService } from 'src/app/core/services/user-state.service';
import { Action, Resource } from 'src/app/core/models/role.model';

@Component({
  selector: 'app-list-session-users',
  templateUrl: './list-session-users.component.html',
  styleUrls: ['./list-session-users.component.scss']
})
export class ListSessionUsersComponent implements OnInit {
  userSessions: UserSessionModels[] = [];
  errorMessage = '';
  searchUsermail: string = '';
  user: any;
  userType: string | null = '';
  title = 'Sessions';
Resource = Resource;
Action = Action;
  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Sessions', active: true }
  ];

  p: number = 1; // Current page number
    itemsPerPage: number = 5; // Number of items per page

  constructor(private userSessionService: UserSessionService,
              private usersService: UsersService,
              public userState: UserStateService,
              private workersService: WorkersService) { }

  ngOnInit(): void {
    this.loadUserSessions();
  }

  loadUserSessions(): void {
    this.userSessionService.getAllUserSessions()
        .subscribe(
            userSessions => {
              // Sort the sessions based on the sessionEnd property
              this.userSessions = userSessions.sort((a, b) => {
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
        this.userSessionService.endSession(Number(userSessionId))
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

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }
  searchUserSessionsByUsermail(): void {
    if (this.searchUsermail.trim() === '') {
      this.loadUserSessions();
    } else {
      this.userSessions = this.userSessions.filter(session =>
          session.usermail.toLowerCase().includes(this.searchUsermail.toLowerCase())
      );
    }
  }

  onUsermailSearchInputChange(): void {
    this.searchUserSessionsByUsermail();
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