import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Order } from 'src/app/core/models/order/order';
import { OrderDto } from 'src/app/core/models/order/order-dto';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-list-order-user',
  templateUrl: './list-order-user.component.html',
  styleUrls: ['./list-order-user.component.scss']
})
export class ListOrderUserComponent implements OnInit {

  list: Order[] = [];
  order: Order;
  search!: string;
  company!: string;

  ordersForm!: UntypedFormGroup;
  submitted = false;
  fileStatus = { status: '', requestType: '', percent: 0 };
  attachementName: string = '';
  isAscending: boolean = true;
  filteredorders: Order[] = [];
  selectedYear: string = 'Tous';
  p: number = 1; // Current page number
  itemsPerPage: number = 5;
  user: User | null = null;
  errorMessage: string;

  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;

  constructor(
    private router: Router,
    private orderservice: OrderServiceService,
    private userStateService: UserStateService,
    private formBuilder: UntypedFormBuilder,
  ) {}

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
      this.user = user;
      if (this.user) this.loadOrder(this.user);
    });

    this.ordersForm = this.formBuilder.group({
      numcomm: ['', [Validators.required]],
      attach: ['', [Validators.required]]
    });
  }

  loadOrder(user: User): void {
    this.orderservice.getOrdersByUser(user.id).subscribe({
      next: data => {
        if (!data || data.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Pas de commandes',
          });
          this.list = [];
          this.filteredorders = [];
        } else {
          this.list = data.filter(order => !order.archiverc);
          this.filteredorders = [...this.list];
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement des commandes',
        });
      }
    });
  }

  cancel(id: number) {
    Swal.fire({
      title: 'Vous êtes sûr(e) ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui!',
    }).then(result => {
      if (result.isConfirmed) {
        this.orderservice.changeStatus(id).subscribe({
          next: (data: Order) => {
            Swal.fire({
              title: data.annuler ? 'Annulée!' : 'Validée!',
              text: data.annuler ? 'La commande a été annulée.' : 'La commande a été validée.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            this.loadOrder(this.user);
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Impossible de changer le statut',
            });
          }
        });
      }
    });
  }

  archive(id: number) {
    Swal.fire({
      title: 'Vous êtes sûr ?',
      text: "Vous ne pouvez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui!',
    }).then(result => {
      if (result.isConfirmed) {
        this.orderservice.archiverc(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Archivée!',
              text: "La commande a été archivée.",
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
            });
            this.loadOrder(this.user);
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Impossible d\'archiver la commande',
            });
          }
        });
      }
    });
  }

  onDownloadFile(filename: string, ordernumber: string, user: User) {
    this.orderservice.download(filename, user.username).subscribe({
      next: event => this.reportProgress(event, ordernumber),
      error: (error: HttpErrorResponse) => {
        console.error(error);
        Swal.fire('Erreur', 'Erreur lors du téléchargement du fichier.', 'error');
      }
    });
  }

  private reportProgress(httpEvent: HttpEvent<string | Blob>, ordernumber: string) {
    if (httpEvent.type === HttpEventType.Response) {
      if (httpEvent.body instanceof Blob) {
        saveAs(httpEvent.body, ordernumber);
      } else {
        console.error('Réponse attendue de type Blob mais obtenu:', typeof httpEvent.body);
      }
    }
  }

  editModal(id: number) {
    this.submitted = false;
    this.showModal?.show();
    this.orderservice.getOrderById(id).subscribe({
      next: data => {
        this.order = data;
        this.ordersForm.patchValue({
          numcomm: this.order.orderName,
          attach: this.order.attachementName ?? ''
        });
        this.attachementName = this.order.attachementName ?? '';
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger la commande', 'error');
      }
    });
  }

  onUploadFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.attachementName = file.name;

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.orderservice.upload(formData, this.user?.username ?? 'anonymous').subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.updateStatus(event.loaded, event.total!, 'Uploading...');
        } else if (event.type === HttpEventType.Response) {
          this.attachementName = event.body?.filename || file.name;
          Swal.fire('Succès', 'Fichier uploadé avec succès', 'success');
        }
      },
      error: err => {
        if (err.status === 400) {
          alert(err.error);
        } else {
          console.error(err);
          Swal.fire('Erreur', 'Erreur lors de l\'upload du fichier', 'error');
        }
      }
    });
  }

  private updateStatus(loaded: number, total: number, requestType: string) {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round((100 * loaded) / total);
  }

  update() {
    if (this.ordersForm.invalid) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    const ordername = this.ordersForm.get('numcomm')?.value;
    const attachementName = this.getFileNameFromPath(this.attachementName || this.ordersForm.get('attach')?.value);

    const updorder: OrderDto = {
      orderName: ordername,
      attachementName
    };

    this.orderservice.updateOrder(this.order.idOrder, updorder).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Commande modifiée',
          showConfirmButton: false,
          timer: 1500
        });
        this.showModal?.hide();
        this.loadOrder(this.user);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Une erreur est survenue lors de la modification',
          footer: 'Réessayez'
        });
      }
    });
  }

  getFileNameFromPath(path: string): string {
    if (!path) return '';
    const parts = path.split('\\');
    return parts[parts.length - 1];
  }

  sortByDate() {
    this.isAscending = !this.isAscending;
    this.list.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
    this.filteredorders = [...this.list];
  }

  onYearChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedYear === 'Tous') {
      this.filteredorders = [...this.list];
    } else {
      this.filteredorders = this.list.filter(order => {
        const year = new Date(order.createdAt).getFullYear().toString();
        return year === this.selectedYear;
      });
    }
  }

  getUniqueYears(): string[] {
    const years = this.list.map(order => new Date(order.createdAt).getFullYear().toString());
    return ['Tous', ...Array.from(new Set(years))];
  }

}
