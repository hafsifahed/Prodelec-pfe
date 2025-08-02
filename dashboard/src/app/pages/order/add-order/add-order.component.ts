import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { DevisService } from 'src/app/core/services/Devis/devis.service';
import { OrderDto } from 'src/app/core/models/order/order-dto';
import { Devis } from 'src/app/core/models/Devis/devis';
import Swal from 'sweetalert2';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Router } from '@angular/router';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { User } from 'src/app/core/models/auth.models';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.scss'],
})
export class AddOrderComponent implements OnInit {
  attachementName = '';
  fileStatus = { status: '', requestType: '', percent: 0 };
  showProductSection = false;
  user: User | null = null;

  // Sélection dans 1ère méthode (template-driven)
  selectedDevis1: Devis | null = null;

  // Liste des devis acceptés
  devisList: Devis[] = [];

  orderName: string = ''; // pour 1ère méthode ngModel

  addForm = new FormGroup({
    orderNumber: new FormControl('', [Validators.required]),
    devis: new FormControl(null), // optionnel
    supplierEmail: new FormControl('', [Validators.required, Validators.email]),
    vat: new FormControl(0, [Validators.required, Validators.min(0)]),
    productName: new FormControl('', [Validators.required]),
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    unitPrice: new FormControl(0, [Validators.required, Validators.min(0)]),
    products: new FormArray([]),
  });

  constructor(
    private router: Router,
    private http: HttpClient,
    private userStateService: UserStateService,
    private fileService: OrderServiceService,
    private devisService: DevisService,
  ) {}

  ngOnInit(): void {
    this.userStateService.user$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.devisService.getAcceptedDevisForCurrentUser().subscribe({
          next: (devisArray) => {
            this.devisList = devisArray;
          },
          error: (err) => {
            console.error('Erreur chargement devis acceptés:', err);
          },
        });
      }
    });
  }

  onUploadFile(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.attachementName = file.name;

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('username', this.user?.username ?? 'anonymous');

    this.fileService.upload(formData, this.user?.username ?? 'anonymous').subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.reportProgress(event);
        }
        if (event.type === HttpEventType.Response) {
          this.attachementName = (event.body as any).filename || file.name;
          input.value = '';
          this.fileStatus.status = 'Done';
        }
      },
      error: (err) => {
        this.fileStatus.status = 'Error';
        if (err.status === 400) {
          alert(err.error);
        } else {
          console.error(err);
        }
      },
    });
  }

  private reportProgress(event: HttpEvent<string | Blob>) {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        this.updateStatus(event.loaded, event.total!, 'Uploading...');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(event.loaded, event.total!, 'Downloading...');
        break;
      case HttpEventType.Response:
        this.fileStatus.status = 'Done';
        break;
      default:
        break;
    }
  }

  private updateStatus(loaded: number, total: number, requestType: string) {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round((100 * loaded) / total);
  }

  addProductFormGroup(productName: string, quantity: number, unitPrice: number) {
    return new FormGroup({
      productName: new FormControl(productName, Validators.required),
      quantity: new FormControl(quantity, [Validators.required, Validators.min(1)]),
      unitPrice: new FormControl(unitPrice, [Validators.required, Validators.min(0)]),
    });
  }

  addProduct(): void {
    const productName = this.addForm.value.productName;
    const quantity = this.addForm.value.quantity;
    const unitPrice = this.addForm.value.unitPrice;

    if (!productName || quantity <= 0 || unitPrice < 0) {
      Swal.fire('Erreur', 'Veuillez remplir correctement les informations produit', 'warning');
      return;
    }

    const productFormGroup = this.addProductFormGroup(productName, quantity, unitPrice);
    (this.addForm.get('products') as FormArray).push(productFormGroup);
    this.addForm.get('productName')?.setValue('');
    this.addForm.get('quantity')?.setValue(1);
    this.addForm.get('unitPrice')?.setValue(0);
    this.showProductSection = true;
  }

  removeProduct(index: number): void {
    (this.addForm.get('products') as FormArray).removeAt(index);
    if ((this.addForm.get('products') as FormArray).length === 0) {
      this.showProductSection = false;
    }
  }

  // 1ère méthode : simple ajout sans PDF (exemple)
  save1() {
    if (!this.user) {
      Swal.fire('Erreur', 'Utilisateur non connecté.', 'error');
      return;
    }
    if (!this.orderName || !this.attachementName) {
      Swal.fire('Erreur', 'Veuillez saisir le numéro de commande et sélectionner un fichier.', 'error');
      return;
    }

    const order: OrderDto = {
      orderName: this.orderName,
      attachementName: this.attachementName,
      devis: this.selectedDevis1 ?? undefined, // optionnel, on peut ne pas sélectionner de devis
    };

    this.fileService.addOrder(order, this.user.id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Commande ajoutée avec succès',
          showConfirmButton: false,
          timer: 1500,
        });
        this.router.navigate(['/listorderclient']);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l\'ajout',
          footer: 'Réessayez',
        });
      },
    });
  }

  // 2ème méthode : formulaire réactif + PDF + upload
  save2() {
    if (!this.user) {
      Swal.fire('Erreur', 'Utilisateur non connecté.', 'error');
      return;
    }
    // Validation partielle (devis optionnel)
    if (this.addForm.get('orderNumber')?.invalid || this.addForm.get('supplierEmail')?.invalid || this.addForm.get('vat')?.invalid) {
      Swal.fire('Erreur', 'Veuillez remplir correctement le formulaire', 'error');
      return;
    }

    const orderNumber = this.addForm.value.orderNumber;
    const supplierEmail = this.addForm.value.supplierEmail;
    const vat = this.addForm.value.vat;
    const products = this.addForm.value.products;

    const selectedDevis: Devis | null = this.addForm.value.devis;

    const pdfContent = this.generatePdfContent(orderNumber, selectedDevis?.numdevis ?? '', supplierEmail, vat, products);
    const pdfDoc = pdfMake.createPdf(pdfContent);

    pdfDoc.getBlob((blob: Blob) => {
      this.attachementName = `order_${orderNumber}.pdf`;

      const formData = new FormData();
      formData.append('file', blob, this.attachementName);

      this.fileService.upload(formData, this.user!.username).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.reportProgress(event);
          }
          if (event.type === HttpEventType.Response) {
            this.saveorder(orderNumber, this.attachementName, selectedDevis);
          }
        },
        error: (error) => {
          if (error.status === 400) {
            alert(error.error);
          } else {
            console.error(error);
          }
        },
      });
    });
  }

  saveorder(orderName: string, attachementName: string, devis: Devis | null) {
    if (!this.user) {
      Swal.fire('Erreur', 'Utilisateur non connecté.', 'error');
      return;
    }

    const order: OrderDto = {
      orderName,
      attachementName,
      devis: devis ?? undefined,
    };

    this.fileService.addOrder(order, this.user.id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Commande ajoutée avec succès',
          showConfirmButton: false,
          timer: 1500,
        });
        this.router.navigate(['/listorderclient']);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Une erreur est survenue lors de l\'ajout',
          footer: 'Réessayez',
        });
      },
    });
  }

  generatePdfContent(
    orderNumber: string,
    devisNumber: string,
    supplierEmail: string,
    vat: number,
    products: any[],
  ) {
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
          color: 'skyblue',
        },
        {
          text: 'Détails Client',
          style: 'sectionHeader',
        },
        {
          columns: [
            [
              { text: this.user?.firstName || '', bold: true },
              { text: this.user?.email || '' },
            ],
            [
              { text: `Numéro de commande : ${orderNumber}`, alignment: 'right' },
              { text: `Date : ${new Date().toLocaleString()}`, alignment: 'right' },
            ],
          ],
        },
        {
          text: 'Détails commandes',
          style: 'sectionHeader',
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Nom de produit', 'Quantité', 'Prix', ''],
              ...products.map((product) => [
                product.productName,
                product.quantity,
                `${product.unitPrice}`,
                '',
              ]),
              ['', '', { text: `Prix HT: ${prixHorsTaxe.toFixed(2)}`, style: 'tableTotal' }, { text: `TVA: ${vat}%`, style: 'tableTotal' }],
              ['', '', '', { text: `Taxe: ${taxe.toFixed(2)}`, style: 'tableTotal' }],
              [{ text: 'Total à payer ', colSpan: 3 }, {}, {}, { text: `${prixPayer.toFixed(2)}`, style: 'tableTotalValue' }],
            ],
          },
        },
        {
          text: '',
          style: 'sectionHeader',
        },
        {
          columns: [
            [{ text: `${supplierEmail}`, alignment: 'right', italics: true }],
            [{ text: 'Signature', alignment: 'right', italics: true }],
          ],
        },
      ],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15, 0, 15],
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
      },
    };
  }
}
