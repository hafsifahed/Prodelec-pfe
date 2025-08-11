import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { Order } from 'src/app/core/models/order/order';
import { OrderDto } from 'src/app/core/models/order/order-dto';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import Swal from 'sweetalert2';
import { User } from 'src/app/core/models/auth.models';

@Component({
  selector: 'app-edit-order-modal',
  templateUrl: './edit-order-modal.component.html',
  styleUrls: ['./edit-order-modal.component.scss']
})
export class EditOrderModalComponent implements OnInit {
  @Input() order!: Order;
  @Input() user!: User;
  @Output() orderUpdated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  ordersForm!: FormGroup;
  fileStatus = { status: '', requestType: '', percent: 0 };
  attachementName: string = '';

  constructor(
    private fb: FormBuilder,
    private orderservice: OrderServiceService
  ) { }

  ngOnInit(): void {
    this.ordersForm = this.fb.group({
      numcomm: ['', [Validators.required]],
      attach: ['', [Validators.required]],
    });

    if (this.order) {
      this.ordersForm.patchValue({
        numcomm: this.order.orderName,
        attach: this.order.attachementName,
      });
      this.attachementName = this.order.attachementName;
    }
  }

  onUploadFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.attachementName = file.name;

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.orderservice.upload(formData, this.user.username).subscribe(
      (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.updateStatus(event.loaded, event.total!, 'Uploading...');
        } else if (event.type === HttpEventType.Response) {
          this.attachementName = event.body;
        }
      },
      (error) => {
        if (error.status === 400) {
          alert(error.error);
        }
      }
    );
  }

  private updateStatus(loaded: number, total: number, requestType: string) {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round((100 * loaded) / total);
  }

  update() {
    const ordername = this.ordersForm.get('numcomm')?.value;
    const attachementName = this.getFileNameFromPath(this.attachementName);

    const updorder: OrderDto = {
      orderName: ordername,
      attachementName,
    };

    this.orderservice.updateOrder(this.order.idOrder, updorder).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Commande modifiée',
          showConfirmButton: false,
          timer: 1500,
        });
        this.orderUpdated.emit();
        this.closeModal();
      },
      () => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Une erreur est survenue lors de la modification",
          footer: 'Réessayez',
        });
      }
    );
  }

  getFileNameFromPath(path: string): string {
    if (!path) return '';
    const parts = path.split('\\');
    return parts[parts.length - 1];
  }

  closeModal() {
    this.modalClosed.emit();
  }
}