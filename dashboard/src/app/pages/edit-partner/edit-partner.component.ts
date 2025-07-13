import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PartnersService } from '../../core/services/partners.service';
import { Partner } from '../../core/models/partner.models';
import { PartnerEditDto } from "../../core/models/partner-edit-dto";
import { User } from 'src/app/core/models/auth.models';
import Swal from 'sweetalert2';

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
    users: [],
    imageUrl: ''
  };

  selectedUsers: User[] = [];
  errorMessage = '';
  imageFile?: File;
  previewUrl: string | ArrayBuffer | null = null;

  title = 'Modifier un Partenaire';
  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Modifier un Partenaire', active: true }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partnersService: PartnersService
  ) {}

  ngOnInit(): void {
    this.getPartner();
  }

  getPartner(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.partnersService.getPartnerById(id).subscribe({
      next: (partner: Partner) => {
        this.partner = {
          id: partner.id,
          name: partner.name,
          address: partner.address,
          tel: partner.tel,
          users: partner.users || [],
          imageUrl: partner.image || ''
        };
        this.previewUrl = this.partner.imageUrl || null;
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération du partenaire', error);
        this.showErrorMessage('Erreur lors de la récupération du partenaire. Veuillez réessayer plus tard.');
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  updatePartner(): void {
    this.partner.users = this.selectedUsers;

    this.partnersService.updatePartner(this.partner.id, this.partner, this.imageFile).subscribe({
      next: () => {
        Swal.fire({
          title: 'Succès!',
          text: 'Partenaire mis à jour avec succès.',
          icon: 'success'
        });
        this.router.navigate(['/list-partner']);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du partenaire', error);
        Swal.fire({
          title: 'Erreur!',
          text: 'Une erreur s\'est produite lors de la mise à jour du partenaire.',
          icon: 'error'
        });
      }
    });
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  getImageUrl(partner: Partner): string {
  return this.partnersService.getPartnerImageUrl(partner);
}

  goBack(): void {
    this.router.navigate(['/list-partner']);
  }
}
