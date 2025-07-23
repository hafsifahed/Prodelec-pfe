import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PartnersService } from '../../core/services/partners.service';
import { Partner } from '../../core/models/partner.models';
import { PartnerEditDto } from "../../core/models/partner-edit-dto";
import { User } from 'src/app/core/models/auth.models';
import Swal from 'sweetalert2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpEventType } from '@angular/common/http';
import { CropperDialogComponent } from '../setting/account-settings/cropper-dialog.component';

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
    image: ''
  };

  selectedUsers: User[] = [];
  errorMessage = '';
  imageFile?: File;
  previewUrl: string | ArrayBuffer | null = null;
  modalRef?: BsModalRef;
  isUploading = false;
  uploadProgress = 0;

  title = 'Modifier un Partenaire';
  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Modifier un Partenaire', active: true }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partnersService: PartnersService,
    private modalService: BsModalService
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
          image: partner.image || ''
        };
        this.previewUrl = this.partnersService.getPartnerImageUrl(partner);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = 'Erreur lors du chargement du partenaire';
      }
    });
  }

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
    this.imageFile = new File([croppedImage], 'partner-image.jpg', {
      type: croppedImage.type || 'image/jpeg'
    });

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(this.imageFile);
  }

  updatePartner(): void {
    if (this.imageFile) {
      this.uploadImage();
    } else {
      this.updatePartnerData();
    }
  }

  uploadImage(): void {
  this.isUploading = true;
  this.uploadProgress = 0;
  
  const formData = new FormData();
  formData.append('file', this.imageFile!);

  this.partnersService.uploadImage(formData).subscribe({
    next: (event: any) => {
      if (event.type === HttpEventType.UploadProgress) {
        // Calcul du pourcentage de progression
        this.uploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
      } else if (event.type === HttpEventType.Response) {
        // Réponse finale du serveur
        if (event.body) {
          this.partner.image = event.body.filename || event.body.url;
          this.updatePartnerData();
        }
      }
    },
    error: (error) => {
      console.error('Upload error:', error);
      this.isUploading = false;
      this.uploadProgress = 0;
      Swal.fire('Erreur', 'Échec de l\'upload de l\'image', 'error');
    }
  });
}

  updatePartnerData(): void {
    this.partnersService.updatePartner(this.partner.id, this.partner).subscribe({
      next: () => {
        Swal.fire('Succès', 'Partenaire mis à jour', 'success');
        this.router.navigate(['/list-partner']);
      },
      error: (error) => {
        console.error('Update error:', error);
        Swal.fire('Erreur', 'Échec de la mise à jour', 'error');
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/list-partner']);
  }
}