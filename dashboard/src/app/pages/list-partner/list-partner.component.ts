import { Component, OnInit } from '@angular/core';
import { Partner } from '../../core/models/partner.models';
import { PartnersService } from '../../core/services/partners.service';
import { Router } from '@angular/router';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { UserModel } from 'src/app/core/models/user.models';

@Component({
  selector: 'app-list-partner',
  templateUrl: './list-partner.component.html',
  styleUrls: ['./list-partner.component.scss']
})
export class ListPartnerComponent implements OnInit {
  partners: Partner[] = [];
  errorMessage = '';
  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Number of items per page
  searchKeyword: string = '';
  user: any;
  userType: string | null = '';
  usersp: UserModel[] = [];
    title = 'Partenaires';

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Partenaires', active: true }
  ];
  displayMode: 'table' | 'grid' = 'grid';


  constructor(
    private partnersService: PartnersService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPartners();
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

  // --- Méthode pour inactiver un partenaire ---
  inactivatePartner(partner: Partner): void {
    Swal.fire({
      title: 'Confirmer l\'inactivation',
      text: `Voulez-vous vraiment inactiver le partenaire "${partner.name}" et tous ses utilisateurs ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, inactiver',
      cancelButtonText: 'Annuler'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.partnersService.inactivatePartner(partner.id).subscribe({
          next: (updatedPartner) => {
            Swal.fire('Inactivé !', `Le partenaire "${updatedPartner.name}" a été inactivé.`, 'success');
            this.loadPartners();
          },
          error: (error) => {
            console.error('Erreur lors de l\'inactivation', error);
            this.showErrorMessage('Erreur lors de l\'inactivation du partenaire. Veuillez réessayer.');
          }
        });
      }
    });
  }

  // --- Méthode pour activer un partenaire ---
  activatePartner(partner: Partner): void {
    Swal.fire({
      title: 'Confirmer l\'activation',
      text: `Voulez-vous vraiment activer le partenaire "${partner.name}" et tous ses utilisateurs ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, activer',
      cancelButtonText: 'Annuler'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.partnersService.activatePartner(partner.id).subscribe({
          next: (updatedPartner) => {
            Swal.fire('Activé !', `Le partenaire "${updatedPartner.name}" a été activé.`, 'success');
            this.loadPartners();
          },
          error: (error) => {
            console.error('Erreur lors de l\'activation', error);
            this.showErrorMessage('Erreur lors de l\'activation du partenaire. Veuillez réessayer.');
          }
        });
      }
    });
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
          user.email.toLowerCase().includes(this.searchKeyword.toLowerCase())
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

  setDisplayMode(mode: 'table' | 'grid') {
  this.displayMode = mode;
}
}
