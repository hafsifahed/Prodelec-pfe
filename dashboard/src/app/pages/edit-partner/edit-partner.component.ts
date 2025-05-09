import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PartnersService } from '../../core/services/partners.service';
import { Partner } from '../../core/models/partner.models';
import Swal from 'sweetalert2';
import { UserModel } from '../../core/models/user.models';
import { PartnerEditDto } from "../../core/models/partner-edit-dto";

@Component({
  selector: 'app-edit-partner',
  templateUrl: './edit-partner.component.html',
  styleUrls: ['./edit-partner.component.scss']
})
export class EditPartnerComponent implements OnInit {
  partner: PartnerEditDto = {
    id: 0,
    name: '',
    address: '',
    tel: '',
    users: []
  };
  selectedUsers: UserModel[] = [];
  errorMessage = '';

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private partnersService: PartnersService
  ) {}

  ngOnInit(): void {
    this.getPartner();
  }

  getPartner(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.partnersService.getPartnerById(id).subscribe(
        (partner: Partner) => {
          this.partner = partner;
        },
        (error: any) => {
          console.error('Erreur lors de la récupération du partenaire', error);
          this.showErrorMessage('Erreur lors de la récupération du partenaire. Veuillez réessayer plus tard.');
        }
    );
  }

  updatePartner(): void {
    this.partner.users = this.selectedUsers;
    this.partnersService.updatePartner(this.partner.id, this.partner).subscribe(
        () => {
          Swal.fire({
            title: 'Succès!',
            text: 'Partenaire mis à jour avec succès.',
            icon: 'success'
          });
          this.router.navigate(['/list-partner']);
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du partenaire', error);
          Swal.fire({
            title: 'Erreur!',
            text: 'Une erreur s\'est produite lors de la mise à jour du partenaire.',
            icon: 'error'
          });
        }
    );
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  goBack() {
    this.router.navigate(['/list-partner']);
  }
}