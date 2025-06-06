import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from 'src/app/core/models/order/order';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';

@Component({
  selector: 'app-order-file',
  templateUrl: './order-file.component.html',
  styleUrls: ['./order-file.component.scss']
})
export class OrderFileComponent {

  blobUrl: SafeResourceUrl | null = null;
  filename:string;
  ido:number;
  mimeType: string;
  order:Order;

  constructor(private router: Router,private sanitizer: DomSanitizer, private actR: ActivatedRoute, private orderservice: OrderServiceService) { }

  getParam() {
    this.actR.paramMap.subscribe(data => {this.filename = String(data.get('filename'));
      this.ido = Number(data.get('ido'));
    });
  }


ngOnInit() {
  this.getParam();
  console.log(this.filename);
  this.orderservice.getOrderById(this.ido).subscribe((data:any)=>{
    this.orderservice.download(this.filename,data.user).subscribe(
      event => {
        console.log(event);
        this.reportProgress(event);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );

  })
  
}

private reportProgress(httpEvent: HttpEvent<string | Blob>) {
  switch (httpEvent.type) {
    case HttpEventType.Response:
      if (httpEvent.body instanceof Blob) {
        this.mimeType = httpEvent.headers.get('Content-Type') || 'application/octet-stream';
        this.blobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(httpEvent.body)
        );
      }
      break;
    default:
      console.log(httpEvent);
  }
}


  viewBlob(blob: Blob) {
    this.blobUrl = URL.createObjectURL(blob);
  }



}
