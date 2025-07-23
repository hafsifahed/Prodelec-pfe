import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cropper-dialog',
  templateUrl: './cropper-dialog.component.html',
  styleUrls: ['./cropper-dialog.component.scss']
})
export class CropperDialogComponent {
  imageChangedEvent: any;
  croppedImage: any;
  onCrop = new Subject<Blob>();

  constructor(public bsModalRef: BsModalRef) {}

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob;
  }

  crop() {
    if (this.croppedImage) {
      this.onCrop.next(this.croppedImage);
      this.bsModalRef.hide();
    }
  }
}