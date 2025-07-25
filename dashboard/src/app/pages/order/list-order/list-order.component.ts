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
import { formatDate } from '@angular/common';
import { PartnersService } from 'src/app/core/services/partners.service';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-list-order',
  templateUrl: './list-order.component.html',
  styleUrls: ['./list-order.component.scss']
})
export class ListOrderComponent {

  list: Order[] = [];
  order:Order;
  search!: string;
  company!:string;
  ordersForm!: UntypedFormGroup;
  projectForm!: UntypedFormGroup;
  submitted = false;
  fileStatus={ status:'',requestType:'',percent:0 };
  attachementName:string;
  listr:any[]=[];
  idorder:number;
  isAscending: boolean = true;
  filteredorders: Order[] = [];
  selectedYear: string = 'Tous'; 
  p: number = 1; // Current page number
  itemsPerPage: number = 5;
    user: User | null = null;
    showConceptionAdd = false;
showMethodeAdd = false;
showProductionAdd = false;
showControleAdd = false;
showLivraisonAdd = false;


  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('showModala', { static: false }) showModala?: ModalDirective;
  constructor(private spartner:PartnersService,
            private userStateService: UserStateService,

    private router: Router, private orderservice: OrderServiceService,private formBuilder: UntypedFormBuilder,private projectservice:ProjectService) {
  }
  ngOnInit() {
    this.orderservice.getAllOrders().subscribe({
      next: (data) => {
        if (data.length == 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de commandes',
          });
        } else {
          console.log(data);
          this.list = data.filter((order) => !order.archivera);
          this.filteredorders = data.filter((order) => !order.archivera);
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

    this.userStateService.user$.subscribe(user => {
      this.user = user;
    });
    this.ordersForm = this.formBuilder.group({
      numcomm: ['', [Validators.required]],
      numdev: ['', [Validators.required]],
      attach: ['', [Validators.required]]
    });

    this.projectForm = this.formBuilder.group({
      refc: ['', [Validators.required]],
      refp: ['', [Validators.required]],
      dlp: ['', [Validators.required]],
      dc: ['', ],
      fc: ['', ],
      dm: ['', ],
      fm: ['', ],
      dp: ['', ],
      fp: ['', ],
      dcf: ['', ],
      fcf: ['', ],
      dl: ['', ],
      fl: ['', ],
      drc: [0, ],
      cdc: ['', ],
      rc: ['', ],
      drm: [0, ],
      cdm: ['', ],
      rm: ['', ],
      drp: [0, ],
      cdp: ['', ],
      rp: ['', ],
      drcf: [0, ],
      cdcf: ['', ],
      rcf: ['', ],
      drl: [0, ],
      cdl: ['', ],
      rl: ['', ],
      qte: [0, [Validators.required]]
    });

    this.orderservice.getAllOrdersworkers().subscribe((res:any)=>{
        this.listr=res;
    });


  }

  delete(id: number) {
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
        this.orderservice.deleteOrder(id).subscribe({
          next: (data) => {
            Swal.fire({
              title: 'Supprimé!',
              text: "La commande a été supprimé.",
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
        this.orderservice.archivera(id).subscribe({
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

  onDownloadFile(filename:string,ordernumber:string,user:User){
    this.orderservice.download(filename,user.username).subscribe(
      event=>{
        console.log(event);
        this.reportProgress(event,ordernumber);
      },
      (error:HttpErrorResponse)=>{
        console.log(error);
      }
    );
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

  addModal(order: any) {
     this.showConceptionAdd = false;
    this.showMethodeAdd = false;
    this.showProductionAdd = false;
    this.showControleAdd = false;
    this.showLivraisonAdd = false;
    this.submitted = false;
    this.idorder=order.idOrder;
    this.showModala?.show()
    
  }

  onUploadFile(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    this.attachementName = file.name;

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.orderservice.upload(formData,this.user.username).subscribe(
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

  addproject() {
  if (this.projectForm.invalid) {
    Swal.fire({
      icon: 'error',
      title: 'Formulaire invalide',
      text: 'Veuillez remplir tous les champs obligatoires.',
    });
    return;
  }

  // Récupération des valeurs du formulaire
  const refclient = this.projectForm.get('refc')?.value;
  const refProdelec = this.projectForm.get('refp')?.value;
  const qte = this.projectForm.get('qte')?.value;
  const datelivprev = this.projectForm.get('dlp')?.value;

  // Conversion des dates en objets Date ou null
  const debcon = this.projectForm.get('dc')?.value ? new Date(formatDate(this.projectForm.get('dc')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const fincon = this.projectForm.get('fc')?.value ? new Date(formatDate(this.projectForm.get('fc')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const debmeth = this.projectForm.get('dm')?.value ? new Date(formatDate(this.projectForm.get('dm')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const finmeth = this.projectForm.get('fm')?.value ? new Date(formatDate(this.projectForm.get('fm')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const debprod = this.projectForm.get('dp')?.value ? new Date(formatDate(this.projectForm.get('dp')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const finprod = this.projectForm.get('fp')?.value ? new Date(formatDate(this.projectForm.get('fp')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const debcf = this.projectForm.get('dcf')?.value ? new Date(formatDate(this.projectForm.get('dcf')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const fincf = this.projectForm.get('fcf')?.value ? new Date(formatDate(this.projectForm.get('fcf')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const debliv = this.projectForm.get('dl')?.value ? new Date(formatDate(this.projectForm.get('dl')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const finliv = this.projectForm.get('fl')?.value ? new Date(formatDate(this.projectForm.get('fl')?.value, 'yyyy-MM-dd', 'en-US')) : null;

  // Récupération des durées (assurez-vous qu'elles sont des nombres ou 0)
  const durecons = Number(this.projectForm.get('drc')?.value) || 0;
  const duremeth = Number(this.projectForm.get('drm')?.value) || 0;
  const durepro = Number(this.projectForm.get('drp')?.value) || 0;
  const durecf = Number(this.projectForm.get('drcf')?.value) || 0;
  const dureliv = Number(this.projectForm.get('drl')?.value) || 0;

  // Récupération des commentaires
  const comcons = this.projectForm.get('cdc')?.value || '';
  const commeth = this.projectForm.get('cdm')?.value || '';
  const comprod = this.projectForm.get('cdp')?.value || '';
  const comcf = this.projectForm.get('cdcf')?.value || '';
  const comliv = this.projectForm.get('cdl')?.value || '';

  // Récupération des responsables (trim et undefined si vide)
  const respcons = (this.projectForm.get('rc')?.value || '').trim() || undefined;
  const resmeth = (this.projectForm.get('rm')?.value || '').trim() || undefined;
  const resprod = (this.projectForm.get('rp')?.value || '').trim() || undefined;
  const rescf = (this.projectForm.get('rcf')?.value || '').trim() || undefined;
  const resliv = (this.projectForm.get('rl')?.value || '').trim() || undefined;

  // Construction de l'objet ProjectDto
  const project: ProjectDto = {
    refClient: refclient, //refclient
    refProdelec: refProdelec,
    qte: qte,
    dlp: datelivprev,
    duree: durecons + duremeth + durepro + durecf + dureliv,
    conceptionComment: comcons,
    conceptionDuration: durecons,
    methodeComment: commeth,
    methodeDuration: duremeth,
    productionComment: comprod,
    productionDuration: durepro,
    finalControlComment: comcf,
    finalControlDuration: durecf,
    deliveryComment: comliv,
    deliveryDuration: dureliv,
    startConception: debcon,
    endConception: fincon,
    startMethode: debmeth,
    endMethode: finmeth,
    startProduction: debprod,
    endProduction: finprod,
    startFc: debcf,
    endFc: fincf,
    startDelivery: debliv,
    endDelivery: finliv
  };

  console.log("Projet DTO = ", project);
  console.log("Responsable production = ", resprod);

  this.projectservice.createProject(project, this.idorder, respcons, resmeth, resprod, rescf, resliv).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Projet ajouté',
        showConfirmButton: false,
        timer: 1500
      });
      this.router.navigate(['/listproject']);
    },
    error: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.error?.message || 'Une erreur est survenue lors de la création du projet.',
        footer: 'Veuillez réessayer'
      });
    }
  });

  this.showModala?.hide();
  setTimeout(() => {
    this.projectForm.reset();
  }, 2000);
  this.projectForm.reset();
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
    }
     else {
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

  toggleSection(modal: 'add' | 'edit', section: string) {
  if (modal === 'add') {
    switch (section) {
      case 'conception': this.showConceptionAdd = !this.showConceptionAdd; break;
      case 'methode': this.showMethodeAdd = !this.showMethodeAdd; break;
      case 'production': this.showProductionAdd = !this.showProductionAdd; break;
      case 'controle': this.showControleAdd = !this.showControleAdd; break;
      case 'livraison': this.showLivraisonAdd = !this.showLivraisonAdd; break;
    }
  }
}
}
