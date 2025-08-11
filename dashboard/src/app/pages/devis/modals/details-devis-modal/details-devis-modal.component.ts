import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Devis, EtatDevis } from 'src/app/core/models/Devis/devis';
import { DevisService } from 'src/app/core/services/Devis/devis.service';

@Component({
  selector: 'app-details-devis-modal',
  templateUrl: './details-devis-modal.component.html',
  styleUrls: ['./details-devis-modal.component.scss']
})
export class DetailsDevisModalComponent {
  @Input() devis: Devis;
  @Output() onDownload = new EventEmitter<string>();
  
  EtatDevis = EtatDevis;

  constructor(public modalRef: BsModalRef) {}

  downloadFile(fileName: string): void {
    this.onDownload.emit(fileName);
  }
}