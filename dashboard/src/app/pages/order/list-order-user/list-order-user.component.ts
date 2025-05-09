import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Order } from 'src/app/core/models/order/order';
import { OrderDto } from 'src/app/core/models/order/order-dto';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { UserModel } from 'src/app/core/models/user.models';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-list-order-user',
  templateUrl: './list-order-user.component.html',
  styleUrls: ['./list-order-user.component.scss']
})
export class ListOrderUserComponent {

  list: Order[] = [];
  order:Order;
  search!: string;
  company!:string;
  ordersForm!: UntypedFormGroup;
  submitted = false;
  fileStatus={ status:'',requestType:'',percent:0 };
  attachementName:string;
  isAscending: boolean = true;
  filteredorders: Order[] = [];
  selectedYear: string = 'Tous'; 
  p: number = 1; // Current page number
  itemsPerPage: number = 5;
  user: UserModel | null = null;
  errorMessage: string;
  userEmail = localStorage.getItem('userMail') || '';
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  constructor(private router: Router, private orderservice: OrderServiceService,private formBuilder: UntypedFormBuilder,private usersService : UsersService) {
  }
  ngOnInit() {

    if (this.userEmail) {
      this.fetchUser(this.userEmail);
      
    }

    

    this.ordersForm = this.formBuilder.group({
      numcomm: ['', [Validators.required]],
      numdev: ['', [Validators.required]],
      attach: ['', [Validators.required]]
    });


  }

  loadOrder(user:UserModel):void{
    this.orderservice.getOrdersByUser(user.id).subscribe({
      next: (data) => {
        if (data.length == 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de commandes',
          });
        } else {
          console.log(data);
          this.list = data.filter((order) => !order.archiverc);
          this.filteredorders = data.filter((order) => !order.archiverc); 
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Il y a un probléme!',
        });
      },
    });
  }

  private fetchUser(email: string): void {
    this.usersService.getUserByEmail(email).subscribe(
        (data) => {
          this.user = data;
          this.loadOrder(data)
          console.log(this.user)
        },
        (error) => {
          console.error('Error fetching user data', error);
          this.errorMessage = 'Error fetching user data. Please try again later.';
        }
    );
    
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderservice.changeStatus(id).subscribe({
          next: (data:Order) => {
            if (data.annuler) {
              Swal.fire({
                title: 'Annulée!',
                text: "La commande a été annulée.",
                icon: 'success',
              });
            } else {
              Swal.fire({
                title: 'Validée!',
                text: "La commande a été validée.",
                icon: 'success',
              });
            }
            location.reload();
          },
          error: (error) => {
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

  onDownloadFile(filename:string,ordernumber:string,user:UserModel){
    this.orderservice.download(filename,user).subscribe(
      event=>{
        console.log(event);
        this.reportProgress(event,ordernumber);
      },
      (error:HttpErrorResponse)=>{
        console.log(error);
      }
    );
  }

  archive(id: number) {
    Swal.fire({
      title: 'Vous etes sure?',
      text: "Vous ne pouvez pas revenir en arriére!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderservice.archiverc(id).subscribe({
          next: (data) => {
            Swal.fire({
              title: 'Archivée!',
              text: "La commande a été archivée.",
              icon: 'success',
            });
            location.reload();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Il y a un probléme!',
            });
          },
        });
      }
    });
  }

  private reportProgress(httpEvent: HttpEvent<string | Blob>,ordernumber:string) {
    switch (httpEvent.type){
      case HttpEventType.Response:
        if (httpEvent.body instanceof Blob) {
          saveAs(httpEvent.body, ordernumber);
        } else {
          console.error('Invalid response body. Expected Blob, but received:', typeof httpEvent.body);
        }
          // saveAs(new Blob([httpEvent.body!],
          //     {type:`${httpEvent.headers.get('Content-Type')};charset=utf-8`}),
          // httpEvent.headers.get('File-Name'));
        break;
      default:
        console.log(httpEvent);
    }
  }

  /**
   * Open Edit modal
   * @param content modal content
   */
  editModal(id: any) {
    this.submitted = false;
    this.showModal?.show()
    this.orderservice.getOrderById(id).subscribe((data) => {
      this.order = data;
      this.ordersForm.controls['numcomm'].setValue(this.order.orderName);
    this.ordersForm.controls['numdev'].setValue(this.order.quoteNumber);
    this.ordersForm.controls['attach'].setValue(this.order.attachementName);
    });
    
  }

  onUploadFile(event: any): void {
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
  }

  update() {
    const ordername = this.ordersForm.get('numcomm')?.value;
    const attachementName = this.getFileNameFromPath(this.ordersForm.get('attach')?.value);
    const quoteNumber = this.ordersForm.get('numdev')?.value;
  
    const updorder: OrderDto = {
      orderName: ordername,
      attachementName: attachementName,
      quoteNumber: quoteNumber
    };
  
    this.orderservice.updateOrder(this.order.idOrder, updorder).subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'Commande modifiée',
        showConfirmButton: false,
        timer: 1500
      });
      location.reload()
    },
    () => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'An error occurred while editing',
        footer: 'Try again'
      });
    });
  
    this.showModal?.hide();
    setTimeout(() => {
      this.ordersForm.reset();
    }, 2000);
    this.ordersForm.reset();
    this.submitted = true;
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
  }

  onYearChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedYear === 'Tous') {
      this.filteredorders = this.list;
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
