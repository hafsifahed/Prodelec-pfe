import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from 'src/app/core/models/order/order';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { Action, Resource } from 'src/app/core/models/role.model';

@Component({
  selector: 'app-list-order',
  templateUrl: './list-order.component.html',
  styleUrls: ['./list-order.component.scss'],
})
export class ListOrderComponent implements OnInit {
  list: Order[] = [];
  search!: string;
  company!: string;
  submitted = false;
  fileStatus = { status: '', requestType: '', percent: 0 };
  attachementName: string = '';
  listr: any[] = [];
  idorder: number = 0;
  isAscending: boolean = true;
  filteredorders: Order[] = [];
  selectedYear: string = 'Tous';
  p: number = 1;
  itemsPerPage: number = 5;
  user: User | null = null;
Resource = Resource;
Action = Action;
  selectedOrder: Order | null = null;

  @ViewChild('editOrderModal') editOrderModal?: ModalDirective;
  @ViewChild('addProjectModal') addProjectModal?: ModalDirective;

  constructor(
    public userStateService: UserStateService,
    private router: Router,
    private orderservice: OrderServiceService,
  ) {}

  ngOnInit() {
    this.loadOrders();
    this.userStateService.user$.subscribe((user) => {
      this.user = user;
    });
    this.orderservice.getAllOrdersworkers().subscribe((res: any) => {
      this.listr = res;
    });
  }

  loadOrders() {
    this.orderservice.getAllOrders().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de commandes',
          });
          this.list = [];
          this.filteredorders = [];
        } else {
          this.list = data.filter((order) => !order.archivera);
          this.filteredorders = [...this.list];
        }
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

  delete(id: number) {
    Swal.fire({
      title: 'Vous êtes sûr ?',
      text: 'Vous ne pouvez pas revenir en arrière !',
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
            this.loadOrdersAfterChange();
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

  changeStatus(id: number) {
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: 'Cette action modifiera l’état de la commande.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, modifier',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.orderservice.changeStatus(id).subscribe({
        next: () => {
          Swal.fire({
            title: 'Modifié !',
            text: "L'état de la commande a été mis à jour.",
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          this.loadOrdersAfterChange();
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: "Une erreur est survenue lors de la modification de l'état.",
          });
        }
      });
    }
  });
}


  archive(id: number) {
    Swal.fire({
      title: 'Vous êtes sûr ?',
      text: 'Vous ne pouvez pas revenir en arrière !',
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
              title: 'Archivée!',
              text: 'La commande a été archivée.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
            this.loadOrdersAfterChange();
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

  private loadOrdersAfterChange() {
    if (this.user) {
      this.orderservice.getAllOrders().subscribe({
        next: (data) => {
          this.list = data.filter((order) => !order.archivera);
          this.applyFilter();
        },
        error: () => { },
      });
    }
  }

  onDownloadFile(filename: string, ordernumber: string, user: User) {
    this.orderservice.download(filename, user.username).subscribe(
      (event) => {
        this.reportProgress(event, ordernumber);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  private reportProgress(httpEvent: any, ordernumber: string) {
    if (httpEvent.type === HttpEventType.Response && httpEvent.body instanceof Blob) {
      saveAs(httpEvent.body, ordernumber);
    }
  }

  editModal(order: Order) {
    this.selectedOrder = order;
    this.editOrderModal?.show();
  }

  addModal(order: Order) {
    this.selectedOrder = order;
    this.addProjectModal?.show();
  }

  onOrderUpdated() {
    this.loadOrdersAfterChange();
    this.editOrderModal?.hide();
  }

  onAddProjectModalClosed() {
    this.addProjectModal?.hide();
  }

  sortByDate() {
    this.isAscending = !this.isAscending;
    this.filteredorders.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  onYearChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedYear === 'Tous') {
      this.filteredorders = [...this.list];
    } else {
      this.filteredorders = this.list.filter((order) => {
        const year = new Date(order.createdAt).getFullYear().toString();
        return year === this.selectedYear;
      });
    }
  }

  getUniqueYears(): string[] {
    const years = this.list.map((order) => new Date(order.createdAt).getFullYear().toString());
    return ['Tous', ...Array.from(new Set(years))];
  }
}