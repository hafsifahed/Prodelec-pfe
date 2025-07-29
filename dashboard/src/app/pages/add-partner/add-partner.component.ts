import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Partner } from '../../core/models/partner.models';
import { PartnersService } from '../../core/services/partners.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CropperDialogComponent } from '../setting/account-settings/cropper-dialog.component';

@Component({
  selector: 'app-add-partner',
  templateUrl: './add-partner.component.html',
  styleUrls: ['./add-partner.component.scss']
})
export class AddPartnerComponent implements OnInit {
  addPartnerForm: FormGroup;
  imageFile?: File;
  previewUrl: string | ArrayBuffer | null = null;
  isSubmitting = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';
  modalRef?: BsModalRef;
  title = 'Ajouter un Partenaire';

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Ajouter un Partenaire', active: true }
  ];

  constructor(
    private fb: FormBuilder,
    private partnersService: PartnersService,
    private router: Router,
    private modalService: BsModalService
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
      const file = input.files[0];
      this.openCropperDialog(file);
    }
  }

  openCropperDialog(file: File): void {
    const initialState = {
      imageChangedEvent: { target: { files: [file] } }
    };
    this.modalRef = this.modalService.show(CropperDialogComponent, {
      initialState,
      class: 'modal-lg'
    });
    this.modalRef.content.onCrop.subscribe((croppedImage: Blob) => {
      this.handleCroppedImage(croppedImage);
    });
  }

  handleCroppedImage(croppedImage: Blob): void {
    this.imageFile = new File([croppedImage], 'partner-image.jpg', { type: croppedImage.type || 'image/jpeg' });
    const reader = new FileReader();
    reader.onload = () => { this.previewUrl = reader.result; };
    reader.readAsDataURL(this.imageFile);
  }

  addPartner(): void {
    if (this.addPartnerForm.invalid || this.isSubmitting) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires.';
      this.addPartnerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    const formValue = this.addPartnerForm.value;
    const partnerData: any = {
      name: formValue.name,
      address: formValue.address,
      tel: formValue.tel
    };
    if (this.imageFile) {
      this.uploadImageAndCreatePartner(partnerData);
    } else {
      this.createPartner(partnerData);
    }
  }

  uploadImageAndCreatePartner(partnerData: any): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    const formData = new FormData();
    formData.append('file', this.imageFile!);
    this.partnersService.uploadImage(formData).subscribe({
      next: (event: any) => {
        if (event.type && event.type === 1) { // HttpEventType.UploadProgress
          this.uploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
        } else if (event.body) {
          partnerData.image = event.body.filename || event.body.url;
          this.isUploading = false;
          this.createPartner(partnerData);
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.isSubmitting = false;
        Swal.fire('Erreur', 'Erreur lors de l\'upload de l\'image', 'error');
      }
    });
  }

  private createPartner(partnerData: Partner): void {
    this.partnersService.addPartner(partnerData).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({
          title: 'Succès!',
          text: 'Partenaire ajouté avec succès.',
          icon: 'success'
        });
        this.router.navigate(['/list-partner']);
      },
      error: (error) => {
        this.isSubmitting = false;
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
