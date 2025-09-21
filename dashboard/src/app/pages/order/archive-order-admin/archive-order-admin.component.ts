import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from 'src/app/core/models/order/order';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { OrderDto } from 'src/app/core/models/order/order-dto';
import { ProjectDto } from 'src/app/core/models/projectfo/project-dto';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { UserModel } from 'src/app/core/models/user.models';
import { User } from 'src/app/core/models/auth.models';

@Component({
  selector: 'app-archive-order-admin',
  templateUrl: './archive-order-admin.component.html',
  styleUrls: ['./archive-order-admin.component.scss']
})
export class ArchiveOrderAdminComponent {
  list: Order[] = [];
  order: Order;
  p: number = 1; // Current page number
  itemsPerPage: number = 5;
  search!: string;

  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('showModala', { static: false }) showModala?: ModalDirective;

  constructor(
    private router: Router,
    private orderservice: OrderServiceService,
    private formBuilder: UntypedFormBuilder,
    private projectservice: ProjectService
  ) {}

  ngOnInit() {
    // Use unified backend method to get archived orders filtered by user role
    this.orderservice.getArchiveByUserRole().subscribe({
      next: (data) => {
        if (data.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de commandes archivées',
          });
        } else {
          console.log(data);
          this.list = data; // Already filtered by backend for archived orders
        }
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

  delete(id: number) {
    Swal.fire({
      title: 'Vous êtes sûr ?',
      text: "Vous ne pouvez pas revenir en arrière!",
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
              text: "La commande a été supprimée.",
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
          },
        });
      }
    });
  }

  restaurer(id: number) {
    Swal.fire({
      title: 'Vous êtes sûr ?',
      text: "Vous ne pouvez pas revenir en arrière!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderservice.archivera(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Restaurée!',
              text: "La commande a été restaurée.",
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
          },
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
}
