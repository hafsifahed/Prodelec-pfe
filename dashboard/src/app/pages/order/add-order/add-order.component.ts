import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { saveAs } from 'file-saver';
import { OrderDto } from 'src/app/core/models/order/order-dto';
import Swal from 'sweetalert2';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import  pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/core/models/user.models';
import { UsersService } from 'src/app/core/services/users.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { User } from 'src/app/core/models/auth.models';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.scss']
})
export class AddOrderComponent implements OnInit{

  orderName: string ="";
  quoteNumber: string ="";
  attachementName: string ="";
  fileStatus={ status:'',requestType:'',percent:0 };
  showProductSection: boolean = false;
  user: User | null = null;
  errorMessage: string;
  constructor(private router: Router,private http: HttpClient,
        private userStateService: UserStateService,

    private fileService:OrderServiceService,private usersService : UsersService,private notificationsService:NotificationService)
  {
  }

  ngOnInit(): void {
        this.userStateService.user$.subscribe(user => {
      this.user = user;
    });
  }



  addForm = new FormGroup({
    orderNumber: new FormControl('', [Validators.required]),
    devisNumber: new FormControl('', [Validators.required]),
    supplierEmail: new FormControl('', [Validators.required]),
    vat: new FormControl(0, [Validators.required]),
    productName: new FormControl('', [Validators.required]),
    quantity: new FormControl(1, [Validators.required]),
    unitPrice: new FormControl(0, [Validators.required]),
    products: new FormArray([])
  });

  onUploadFile(evt: Event): void {
  const input = evt.target as HTMLInputElement;
  const file   = input.files?.[0];
  if (!file) { return; }

  // On stocke immédiatement le nom (facultatif — pour l’affichage)
  this.attachementName = file.name;

  const formData = new FormData();
  formData.append('file', file, file.name);
  // Si ton backend range par utilisateur
  formData.append('username', this.user?.username ?? 'anonymous');

  this.fileService.upload(formData,this.user.username).subscribe({
    next: (event) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.reportProgress(event);
      }
      if (event.type === HttpEventType.Response) {
        /* le backend renvoie { filename: 'res-123.txt' } */
        this.attachementName = (event.body as any).filename;  // ✅ chaîne simple
        console.log('upload ok →', this.attachementName);
        // (optionnel) : vider l’input pour pouvoir re-sélectionner le même fichier
        input.value = '';
      }
    },
    error: (err) => {
      if (err.status === 400) {
        alert(err.error);
      } else {
        console.error(err);
      }
    }
  });
}


  private reportProgress(httpEvent: HttpEvent<string | Blob>) {
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

  save1()
  {

    const order: OrderDto = {
      "orderName" : this.orderName,
      "attachementName" : this.attachementName,
      "quoteNumber" : this.quoteNumber
    };
    this.fileService.addOrder(order,this.user.id).subscribe((response: any) => {
      Swal.fire({
        icon: 'success',
        title: 'Added successfully',
        showConfirmButton: false,
        timer: 1500
      });
      this.router.navigate(['/listorderclient']);
    },
    (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'An error occurred while adding',
        footer: 'Try Again'
      });
    });
  }

  addProductFormGroup(productName: string, quantity: number, unitPrice: number) {

    return new FormGroup({
      productName: new FormControl(productName, Validators.required),
      quantity: new FormControl(quantity, Validators.required),
      unitPrice: new FormControl(unitPrice, Validators.required)
    });
  }

  addProduct(): void {
    const productName = this.addForm.value.productName;
    const quantity = this.addForm.value.quantity;
    const unitPrice = this.addForm.value.unitPrice;


    const productFormGroup = this.addProductFormGroup(productName, quantity, unitPrice);
    (this.addForm.get('products') as FormArray).push(productFormGroup);
    // Réinitialiser le formulaire d'ajout de produit après l'ajout
    this.addForm.get('productName').setValue('');
    this.showProductSection = true;
  }

  removeProduct(index: number): void {
    (this.addForm.get('products') as FormArray).removeAt(index);
  }

  save2() {
    // Récupérer les valeurs du formulaire
    const orderNumber = this.addForm.value.orderNumber;
    const devisNumber = this.addForm.value.devisNumber;
    const supplierEmail = this.addForm.value.supplierEmail;
    const vat = this.addForm.value.vat;
    const products = this.addForm.value.products;
  
    // Créer le PDF
    const pdfContent = this.generatePdfContent(orderNumber, devisNumber, supplierEmail, vat, products);
    const pdfDoc = pdfMake.createPdf(pdfContent);
     pdfDoc.getBlob((blob:Blob)=>{
      this.attachementName = `order_${orderNumber}.pdf`;
  
    // Uploader le fichier PDF
    const formData = new FormData();
    formData.append('file', blob, this.attachementName);
  
    this.fileService.upload(formData,this.user.username).subscribe(
      (event: any) => {
        
        
      },
      (error) => {
        if (error.status === 400) {
          const errorMessage = error.error;
          console.log(errorMessage);
          alert(errorMessage);
        }
      }
    );
     });
     this.saveorder();
    
  }
  saveorder(){
    // Enregistrer la commande avec les informations du formulaire et du fichier PDF
    const order: OrderDto = {
      "orderName": this.addForm.value.orderNumber,
      "attachementName": `order_${this.addForm.value.orderNumber}.pdf`,
      "quoteNumber": this.addForm.value.devisNumber
    };
    this.fileService.addOrder(order,this.user.id).subscribe(
      (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Added successfully',
          showConfirmButton: false,
          timer: 1500
        });
        this.router.navigate(['/listorderclient']);
      },
      (error: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'An error occurred while adding',
          footer: 'Try Again'
        });
      }
    );
  }
  
  generatePdfContent(orderNumber: string, devisNumber: string, supplierEmail: string, vat: number, products: any[]) {
    const prixHorsTaxe = products.reduce((acc, product) => acc + product.quantity * product.unitPrice, 0);
        
          
            const taxe = (prixHorsTaxe * vat) / 100;
       
            const prixPayer = prixHorsTaxe + taxe;
        
            return {
                content: [
                  {
                    text: 'Commande',
                    fontSize: 20,
                    bold: true,
                    alignment: 'center',
                    decoration: 'underline',
                    color: 'skyblue'
                  },
                  {
                    text: 'Details Client',
                    style: 'sectionHeader'
                  },
                    
                    
                    {
                      columns: [
                        [
                          {
                            text: this.user.firstName,
                            bold:true
                          },
                          { text: this.user.email },
                        ],
                        [
                          { 
                            text: `ordre Numéro : ${orderNumber}`,
                            alignment: 'right'
                          },
                          {
                            text: `Date: ${new Date().toLocaleString()}`,
                            alignment: 'right'
                          }
                        ]
                      ]
                    },
                 
                    {
                      text: 'Details commandes',
                      style: 'sectionHeader'
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', 'auto', 'auto', 'auto'],
                            body: [
                                ['Nom de produit', 'Quantité', 'Prix', ''],
                                ...products.map(product => [
                                  product.productName,
                                  product.quantity,
                                    `${product.unitPrice}`,
                                    ''
                                ]),
                                ['', '', { text: `Prix sans taxe: ${prixHorsTaxe}`, style: 'tableTotal' }, { text: `TVA: ${vat}%`, style: 'tableTotal' }],
                                ['', '', '', { text: `Tax: ${taxe}`, style: 'tableTotal' }],
                                [{text : 'Total a payer ' , colSpan: 3},{},{} , { text: `${prixPayer}`, style: 'tableTotalValue' }]
                            ]
                        }
                    },
                    {
                      text: '',
                      style: 'sectionHeader'
                    },
                    {
                      columns: [
                        [{ text: `${supplierEmail}`, alignment: 'right', italics: true }],
                        [{ text: 'Signature', alignment: 'right', italics: true}],
                      ]
                    }
                ],
                styles: {
                    header: {
                        fontSize: 16,
                        bold: true,
                        alignment: 'center',
                        margin: [0, 0, 0, 10],
                        fillColor: '#083355'
                    },
                    subheader: {
                        fontSize: 14,
                        bold: true,
                        alignment: 'left',
                        margin: [0, 10, 0, 10],
                    },
                    title: {
                        fontSize: 14,
                        bold: true,
                        alignment: 'left',
                        margin: [0, 10, 0, 10],
                    },
                    subtitle: {
                        fontSize: 12,
                        alignment: 'left',
                        margin: [0, 0, 0, 5]
                    },
                    customerName: {
                        fontSize: 12,
                        bold: true,
                        alignment: 'left',
                        margin: [0, 10, 0, 10]
                    },
                    tableTotal: {
                        fontSize: 10,
                        bold: true,
                        alignment: 'right',
                        margin: [0, 10, 0, 10],
                    },
                    tableTotalValue: {
                        fontSize: 10,
                        bold: true,
                        alignment: 'right',
                        margin: [0, 10, 0, 10],
                        color: '#00305d',
                    },
                    legal: {
                        fontSize: 10,
                        alignment: 'left',
                        margin: [0, 10, 0, 0],
                        color: '#a3a3a3'
                    },
                    sectionHeader: {
                      bold: true,
                      decoration: 'underline',
                      fontSize: 14,
                      margin: [0, 15,0, 15]          
                    }
                }
            };
  }
  

}
