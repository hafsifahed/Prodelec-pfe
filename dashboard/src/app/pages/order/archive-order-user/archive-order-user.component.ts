import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Order } from 'src/app/core/models/order/order';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { UsersService } from 'src/app/core/services/users.service';
import { User } from 'src/app/core/models/auth.models';

@Component({
  selector: 'app-archive-order-user',
  templateUrl: './archive-order-user.component.html',
  styleUrls: ['./archive-order-user.component.scss']
})
export class ArchiveOrderUserComponent {
  list: Order[] = [];
  order: Order;
  search!: string;
  company!: string;
  ordersForm!: UntypedFormGroup;
  submitted = false;
  fileStatus = { status: '', requestType: '', percent: 0 };
  attachementName: string;
  p: number = 1; // Current page number
  itemsPerPage: number = 5;
  user: User | null = null;
  errorMessage: string;
  userEmail = localStorage.getItem('userMail') || '';

  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;

  constructor(
    private router: Router,
    private orderservice: OrderServiceService,
    private formBuilder: UntypedFormBuilder,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    // Fetch archived orders filtered by current user role, merged logic
    this.orderservice.getArchiveByUserRole().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de commandes archivées',
          });
          this.list = [];
        } else {
          console.log('Archived orders:', data);
          this.list = data;
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Erreur lors du chargement des commandes archivées!',
        });
        console.error('Error fetching archived orders', error);
      }
    });
  }

  delete(id: number) {
    Swal.fire({
      title: 'Vous êtes sûr ?',
      text: 'Vous ne pouvez pas revenir en arrière!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderservice.deleteOrder(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé!',
              text: 'La commande a été supprimée.',
              icon: 'success',
            });
            location.reload();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Il y a un problème!',
            });
          }
        });
      }
    });
  }

  restaurer(id: number) {
    Swal.fire({
      title: 'Vous êtes sûr ?',
      text: 'Vous ne pouvez pas revenir en arrière!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderservice.archiverc(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Restaurée!',
              text: 'La commande a été restaurée.',
              icon: 'success',
            });
            location.reload();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Il y a un problème!',
            });
          }
        });
      }
    });
  }

  onDownloadFile(filename: string, ordernumber: string, user: User) {
    this.orderservice.download(filename, user.username).subscribe({
      next: (event: HttpEvent<Blob>) => {
        this.reportProgress(event, ordernumber);
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      }
    });
  }

  private reportProgress(httpEvent: HttpEvent<string | Blob>, ordernumber: string) {
    switch (httpEvent.type) {
      case HttpEventType.Response:
        if (httpEvent.body instanceof Blob) {
          saveAs(httpEvent.body, ordernumber);
        } else {
          console.error('Invalid response body. Expected Blob, but received:', typeof httpEvent.body);
        }
        break;
      default:
        console.log(httpEvent);
    }
  }

  getFileNameFromPath(path: string): string {
    if (!path) return '';
    const parts = path.split('\\');
    
    return parts[parts.length - 1];
  }


   /* onUploadFile(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    this.attachementName = file.name;

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.orderservice.upload(formData).subscribe(
      (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          // Handle upload progress (if needed)
          this.reportProgress1(event);
        } else if (event.type === HttpEventType.Response) {
          // Handle the final response
          this.attachementName = event.body;
          console.log(this.attachementName);
        }
      },
      (error) => {
        if (error.status === 400) {
          const errorMessage = error.error;
          console.log(errorMessage);
          alert(errorMessage);
        }
      }
    );
  }

  private reportProgress1(httpEvent: HttpEvent<string | Blob>) {
    switch (httpEvent.type){
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded,httpEvent.total!,'Uploading...');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(httpEvent.loaded,httpEvent.total!,'Downloading...');
        break;
      case HttpEventType.ResponseHeader:
        console.log('Header returned',httpEvent);
        break;
      case HttpEventType.Response:
        if(httpEvent.body instanceof String){
          this.fileStatus.status='Done';
        }else {
          saveAs(new File([httpEvent.body!],httpEvent.headers.get('File-Name')!,
            {type:`${httpEvent.headers.get('Content-Type')};charset=utf-8`}));

          // saveAs(new Blob([httpEvent.body!],
          //     {type:`${httpEvent.headers.get('Content-Type')};charset=utf-8`}),
          // httpEvent.headers.get('File-Name'));
        }
        this.fileStatus.status='Done';
        break;
      default:
        console.log(httpEvent);
    }
  }

  private updateStatus(loaded: number, total: number , requestType: string) {
    this.fileStatus.status='progress';
    this.fileStatus.requestType=requestType;
    this.fileStatus.percent=Math.round(100*loaded/total);
  }*/
  


}
