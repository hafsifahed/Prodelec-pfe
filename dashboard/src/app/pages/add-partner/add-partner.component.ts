import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Partner } from '../../core/models/partner.models';
import { PartnersService } from '../../core/services/partners.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-partner',
  templateUrl: './add-partner.component.html',
  styleUrls: ['./add-partner.component.scss']
})
export class AddPartnerComponent implements OnInit {
  addPartnerForm: FormGroup;
  imageFile?: File;
  previewUrl: string | ArrayBuffer | null = null;
  errorMessage = '';
  title = 'Ajouter un Partenaire';

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Ajouter un Partenaire', active: true }
  ];

  constructor(
    private fb: FormBuilder,
    private partnersService: PartnersService,
    private router: Router
  ) {
    this.addPartnerForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      tel: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]]
    });
  }

  ngOnInit(): void {}

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result;
      reader.readAsDataURL(this.imageFile);
    }
  }

  addPartner(): void {
    if (this.addPartnerForm.invalid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires.';
      this.addPartnerForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';

    const formValue = this.addPartnerForm.value;

    const partnerData: any = {
      name: formValue.name,
      address: formValue.address,
      tel: formValue.tel
    };

    if (this.imageFile) {
      // Upload séparé de l'image
      const formData = new FormData();
      formData.append('file', this.imageFile);

      this.partnersService.uploadImage(formData).subscribe({
        next: (uploadResp) => {
          // Ajouter le nom ou url de l'image dans les données du partenaire
          partnerData.image = uploadResp.filename || uploadResp.url;
          this.createPartner(partnerData);
        },
        error: (error) => {
          console.error('Erreur lors de l\'upload de l\'image', error);
          Swal.fire('Erreur', 'Erreur lors de l\'upload de l\'image', 'error');
        }
      });
    } else {
      // Pas d'image, création directe
      this.createPartner(partnerData);
    }
  }

  private createPartner(partnerData: Partner): void {
    this.partnersService.addPartner(partnerData).subscribe({
      next: () => {
        Swal.fire({
          title: 'Succès!',
          text: 'Partenaire ajouté avec succès.',
          icon: 'success'
        });
        this.router.navigate(['/list-partner']);
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du partenaire', error);
        Swal.fire({
          title: 'Erreur!',
          text: 'Erreur lors de l\'ajout du partenaire. Veuillez réessayer ultérieurement.',
          icon: 'error'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/list-partner']);
  }
}
