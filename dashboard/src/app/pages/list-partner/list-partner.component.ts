import {Component, OnInit} from '@angular/core';
import { Partner } from '../../core/models/partner.models';
import { PartnersService } from '../../core/services/partners.service';
import { Router } from '@angular/router';
import Swal, {SweetAlertResult} from 'sweetalert2';
import {WorkersService} from "../../core/services/workers.service";
import {UsersService} from "../../core/services/users.service";
import { UserModel } from 'src/app/core/models/user.models';

@Component({
  selector: 'app-list-partner',
  templateUrl: './list-partner.component.html',
  styleUrls: ['./list-partner.component.scss']
})
export class ListPartnerComponent implements OnInit{
  partners: Partner[] = [];
  errorMessage = '';
  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Number of items per page
  searchKeyword: string = '';
  user: any;
  userType: string | null = '';
  usersp: UserModel[] = [];

  constructor(private partnersService: PartnersService,
              private router: Router,
              private usersService: UsersService,
              private workersService: WorkersService) {
  }
  ngOnInit(): void {
    this.loadPartners();
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

  loadPartners(): void {
    this.partnersService.getAllPartners()
        .subscribe(
            partners => {
              this.partners = partners;
              this.partners.forEach(partner => this.loadUsersByPartner(partner));
            },
            error => {
              console.error('Error loading partners', error);
              this.showErrorMessage('Error loading partners. Please try again later.');
            }
        );
  }
  private loadUsersByPartner(partner: Partner): void {
    if (!partner.id) {
      console.error('Partner ID is undefined.');
      return;
    }
    this.partnersService.getUsersByPartnerId(partner.id).subscribe(
      users => {
        partner.users = users;
      },
      error => {
        console.error('Error loading users for partner', error);
        this.showErrorMessage('Error loading users. Please try again later.');
      }
    );
  }
  deletePartner(partnerId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this partner!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.partnersService.deletePartner(partnerId)
            .subscribe(
                () => {
                  Swal.fire('Deleted!', 'Partner has been deleted.', 'success');
                  this.loadPartners();
                },
                error => {
                  console.error('Error deleting partner', error);
                  this.showErrorMessage('Error deleting partner. Please try again later.');
                }
            );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your partner is safe :)', 'error');
      }
    });
  }

  editPartner(partner: Partner): void {
    this.router.navigate(['/edit-partner', partner.id]);
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  searchPartners(): void {
    if (this.searchKeyword.trim() === '') {
      this.loadPartners();
    } else {
      this.partners = this.partners.filter(partner =>
          partner.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          String(partner.id).includes(this.searchKeyword) ||
          partner.users.some(user =>
              user.email.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
              user.role.toLowerCase().includes(this.searchKeyword.toLowerCase())
          )
      );
    }
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.loadPartners();
  }

  onSearchInputChange(): void {
    this.searchPartners();
  }

  navigateToAddPartner(): void {
    this.router.navigate(['/add-partner']);
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