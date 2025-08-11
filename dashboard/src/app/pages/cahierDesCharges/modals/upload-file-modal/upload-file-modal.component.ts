import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';

@Component({
  selector: 'app-upload-file-modal',
  templateUrl: './upload-file-modal.component.html',
  styleUrls: ['./upload-file-modal.component.scss']
})
export class UploadFileModalComponent {
  @Input() cdcId: number;
  @Input() user: any;
  @Output() onUpload = new EventEmitter<void>();
  
  selectedFiles: File[] = [];

  constructor(
    public modalRef: BsModalRef,
    private cdcService: CdcServiceService
  ) {}

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  uploadFiles() {
    if (this.selectedFiles.length > 0 && this.cdcId && this.user) {
      this.cdcService.uploadMultipleFiles(this.selectedFiles, this.user.username, this.cdcId)
        .subscribe({
          next: () => {
            Swal.fire('Succès', 'Fichiers uploadés avec succès', 'success');
            this.selectedFiles = [];
            this.onUpload.emit();
            this.modalRef.hide();
          },
          error: err => {
            console.error(err);
            Swal.fire('Erreur', 'Échec de l\'upload des fichiers', 'error');
          }
        });
    }
  }
}