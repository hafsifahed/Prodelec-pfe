import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CahierDesCharges } from 'src/app/core/models/CahierDesCharges/cahier-des-charges';
import { CdcServiceService } from 'src/app/core/services/cdcService/cdc-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-details-cdc-admin-modal',
  templateUrl: './details-cdc-admin-modal.component.html',
  styleUrls: ['./details-cdc-admin-modal.component.scss']
})
export class DetailsCdcAdminModalComponent {
  @Input() cahier: CahierDesCharges;
  @Output() onFileDownload = new EventEmitter<{fileName: string, id: number}>();
  
  pdfUrl: string | null = null;
  loadingPdf: boolean = false;
  pdfError: string | null = null;

  constructor(
    public modalRef: BsModalRef,
    private cdcService: CdcServiceService
  ) {}

  loadPDF(fileName: string): void {
    if (!this.cahier || !this.cahier.user) return;

    this.loadingPdf = true;
    this.pdfError = null;
    this.cdcService.downloadFile(fileName, this.cahier.user).subscribe({
      next: (blob) => {
        this.pdfUrl = URL.createObjectURL(blob);
        this.loadingPdf = false;
      },
      error: (error) => {
        console.error('Error loading PDF', error);
        this.pdfError = 'Erreur lors du chargement du PDF';
        this.loadingPdf = false;
      }
    });
  }

  downloadFile(fileName: string, id: number): void {
    this.onFileDownload.emit({ fileName, id });
  }
}