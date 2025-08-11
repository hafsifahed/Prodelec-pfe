import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Order } from 'src/app/core/models/order/order';
import { OrderDto } from 'src/app/core/models/order/order-dto';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { HttpEventType } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-order-modal',
  templateUrl: './edit-order-modal.component.html',
  styleUrls: ['./edit-order-modal.component.scss']
})
export class EditOrderUserModalComponent {
  @Input() order!: Order;
  @Input() username!: string;
  @Output() onOrderUpdated = new EventEmitter<void>();
  
  ordersForm!: FormGroup;
  submitted = false;
  fileStatus = { status: '', requestType: '', percent: 0 };
  attachementName: string = '';

  constructor(
    public modalRef: BsModalRef,
    private orderService: OrderServiceService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.ordersForm = this.formBuilder.group({
      numcomm: [this.order.orderName, [Validators.required]],
      attach: [this.order.attachementName || '']
    });
    this.attachementName = this.order.attachementName || '';
  }

  onUploadFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.attachementName = file.name;

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.orderService.upload(formData, this.username).subscribe({
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

    this.orderService.updateOrder(this.order.idOrder, updorder).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Commande modifiée',
          showConfirmButton: false,
          timer: 1500
        });
        this.onOrderUpdated.emit();
        this.modalRef.hide();
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
}