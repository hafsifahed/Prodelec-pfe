import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { Project } from 'src/app/core/models/projectfo/project';
import { ProjectDto } from 'src/app/core/models/projectfo/project-dto';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { WorkersService } from 'src/app/core/services/workers.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-project',
  templateUrl: './list-project.component.html',
  styleUrls: ['./list-project.component.scss']
})
export class ListProjectComponent implements OnInit, OnDestroy {

  list: Project[] = [];
  flist: any[] = [];
  search!: string;
  projectsForm!: UntypedFormGroup;
  completedDuration = 0;
  progress: number = 0;
  searchTerm: string ;
  submitted = false;
  project:any;
  listr:any[]=[];
  projectForm!: UntypedFormGroup;
  project1:any;
  project2:Project;
  isAscending: boolean = true;
  selectedYear: string = 'Tous'; 
  p: number = 1; // Current page number
  itemsPerPage: number = 3;
  modalRef?: BsModalRef;
  userr: any;
    title = 'Projets'; // Ajouté pour le breadcrumb si tu en utilises un

  breadcrumbItems = [ // Ajouté pour le breadcrumb si tu en utilises un
    { label: 'Accueil', active: false },
    { label: 'Projets', active: true }
  ];
  
displayMode: 'table' | 'grid' = 'grid';

        // Pour modal Ajout
    showConceptionAdd = false;
    showMethodeAdd = false;
    showProductionAdd = false;
    showControleAdd = false;
    showLivraisonAdd = false;

    // Pour modal Modification
    showConceptionEdit = false;
    showMethodeEdit = false;
    showProductionEdit = false;
    showControleEdit = false;
    showLivraisonEdit = false;


    private progressSubjects = {
    conception: new Subject<{ project: any, value: number }>(),
    methode: new Subject<{ project: any, value: number }>(),
    production: new Subject<{ project: any, value: number }>(),
    fc: new Subject<{ project: any, value: number }>(),
    delivery: new Subject<{ project: any, value: number }>()
  };
  private progressSubscriptions: Subscription[] = [];

  
  @ViewChild('showModal', { static: false }) showModal?: ModalDirective;
  @ViewChild('showModala', { static: false }) showModala?: ModalDirective;
  @ViewChild('detailsconModal') detailsconModal?: TemplateRef<any>;
  @ViewChild('detailsmetModal') detailsmetModal?: TemplateRef<any>;
  @ViewChild('detailsprodModal') detailsprodModal?: TemplateRef<any>;
  @ViewChild('detailsfcModal') detailsfcModal?: TemplateRef<any>;
  @ViewChild('detailsdelModal') detailsdelModal?: TemplateRef<any>;
  constructor(private workersService: WorkersService,
        private userStateService: UserStateService,
    private router: Router, private orderservice: OrderServiceService, private projectservice: ProjectService, private formBuilder: UntypedFormBuilder,private modalService: BsModalService) {
  }

  ngOnInit() {
this.userStateService.user$.subscribe(user => {
      this.userr = user;
    });

    this.projectservice.getAllProjects().subscribe({
      next: (data) => {
        if (data.length == 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de projets',
          });
        } else {
          this.list = data.filter((project) => !project.archivera);
          this.flist=data.filter((project) => !project.archivera);
          console.log(this.flist);
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

    this.projectsForm = this.formBuilder.group({
      dlp: ['', [Validators.required]],
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
      qte: ['', [Validators.required]]
    });

    this.projectForm = this.formBuilder.group({
      refc: ['', [Validators.required]],
      refp: ['', [Validators.required]],
      dlp: ['', [Validators.required]],
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
      qte: [0, [Validators.required]]
    });

    this.orderservice.getAllOrdersworkers().subscribe((res:any)=>{
      this.listr=res;
  });

  this.initDebounce('conception');
    this.initDebounce('methode');
    this.initDebounce('production');
    this.initDebounce('fc');
    this.initDebounce('delivery');
  }

   ngOnDestroy() {
    this.progressSubscriptions.forEach(sub => sub.unsubscribe());
  }

    private initDebounce(step: keyof typeof this.progressSubjects) {
    const sub = this.progressSubjects[step].pipe(debounceTime(700)).subscribe(({ project, value }) => {
      this.sendProgress(step, project, value);
    });
    this.progressSubscriptions.push(sub);
  }

  // Méthode générique appelée après le debounce
  private sendProgress(step: string, project: any, value: number) {
    // Met à jour la propriété locale pour l'affichage immédiat
    project[`${step}progress`] = value;

    // Appelle le service adapté selon l'étape
    let progressApi, realApi, statusApi, statusField;
    switch (step) {
      case 'conception':
        progressApi = this.projectservice.progressc.bind(this.projectservice);
        realApi = this.projectservice.changeRealc.bind(this.projectservice);
        statusApi = this.projectservice.changeStatusConception1.bind(this.projectservice);
        statusField = 'conceptionStatus';
        break;
      case 'methode':
        progressApi = this.projectservice.progressm.bind(this.projectservice);
        realApi = this.projectservice.changeRealm.bind(this.projectservice);
        statusApi = this.projectservice.changeStatusMethode1.bind(this.projectservice);
        statusField = 'methodeStatus';
        break;
      case 'production':
        progressApi = this.projectservice.progressp.bind(this.projectservice);
        realApi = this.projectservice.changeRealp.bind(this.projectservice);
        statusApi = this.projectservice.changeStatusProduction1.bind(this.projectservice);
        statusField = 'productionStatus';
        break;
      case 'fc':
        progressApi = this.projectservice.progressfc.bind(this.projectservice);
        realApi = this.projectservice.changeRealfc.bind(this.projectservice);
        statusApi = this.projectservice.changeStatusFC1.bind(this.projectservice);
        statusField = 'finalControlStatus';
        break;
      case 'delivery':
        progressApi = this.projectservice.progressd.bind(this.projectservice);
        realApi = this.projectservice.changeReall.bind(this.projectservice);
        statusApi = this.projectservice.changeStatusDelivery1.bind(this.projectservice);
        statusField = 'deliveryStatus';
        break;
    }

    progressApi(project.idproject, value).subscribe(() => {
      if (value === 100) {
        realApi(project.idproject).subscribe(() => {
          this.toggleTaskStatus(project, statusField);
        });
      } else {
        statusApi(project.idproject).subscribe(() => {
          project[statusField] = false;
          this.calculateProgress(project);
        });
      }
    });
  }

  // Méthode appelée par le HTML
  onProgressInput(project: any, value: number, step: keyof typeof this.progressSubjects) {
    project[`${step}progress`] = value;
    this.progressSubjects[step].next({ project, value });
  }

  calculateProgress(project: Project) {
    this.projectservice.changeprogress(project.idproject).subscribe((res:any)=>{
      project.progress=res.progress;
    });
  }

  addModal(project: any) {
    this.showConceptionAdd = false;
    this.showMethodeAdd = false;
    this.showProductionAdd = false;
    this.showControleAdd = false;
    this.showLivraisonAdd = false;
    this.submitted = false;
    this.project=project;
    this.showModala?.show()
    
  }

  openDetailsconsModal(project: Project): void {
    this.project2=project;
    this.modalRef = this.modalService.show(this.detailsconModal!, { class: 'modal-md' });
  }
  openDetailsmetModal(project: Project): void {
    this.project2=project;
    this.modalRef = this.modalService.show(this.detailsmetModal!, { class: 'modal-md' });
  }
  openDetailsprodModal(project: Project): void {
    this.project2=project;
    this.modalRef = this.modalService.show(this.detailsprodModal!, { class: 'modal-md' });
  }
  openDetailsfcModal(project: Project): void {
    this.project2=project;
    this.modalRef = this.modalService.show(this.detailsfcModal!, { class: 'modal-md' });
  }
  openDetailsdelModal(project: Project): void {
    this.project2=project;
    this.modalRef = this.modalService.show(this.detailsdelModal!, { class: 'modal-md' });
  }
  /**
   * Open Edit modal
   * @param content modal content
   */
  editModal(id: any) {
    this.showConceptionEdit = false;
    this.showMethodeEdit = false;
    this.showProductionEdit = false;
    this.showControleEdit = false;
    this.showLivraisonEdit = false;

    this.submitted = false;
    this.showModal?.show()
    this.projectservice.getProjectById(id).subscribe((data) => {
      this.project1 = data;
      this.projectForm.controls['refc'].setValue(this.project1.refClient);
    this.projectForm.controls['refp'].setValue(this.project1.refProdelec);
    this.projectForm.controls['rc'].setValue(this.project1.conceptionResponsible?.firstName || '');
    this.projectForm.controls['rm'].setValue(this.project1.methodeResponsible?.firstName || '');
    this.projectForm.controls['rp'].setValue(this.project1.productionResponsible?.firstName || '');
    this.projectForm.controls['rcf'].setValue(this.project1.finalControlResponsible?.firstName || '');
    this.projectForm.controls['rl'].setValue(this.project1.deliveryResponsible?.firstName || '');
this.projectForm.controls['dlp'].setValue(this.project1.dlp ? formatDate(this.project1.dlp, 'MM/dd/yyyy', 'en-US') : null);
this.projectForm.controls['dc'].setValue(this.project1.startConception ? formatDate(this.project1.startConception, 'MM/dd/yyyy', 'en-US') : null);
this.projectForm.controls['fc'].setValue(this.project1.endConception ? formatDate(this.project1.endConception, 'MM/dd/yyyy', 'en-US') : null);
this.projectForm.controls['dm'].setValue(this.project1.startMethode ? formatDate(this.project1.startMethode, 'MM/dd/yyyy', 'en-US') : null);
this.projectForm.controls['fm'].setValue(this.project1.endMethode ? formatDate(this.project1.endMethode, 'MM/dd/yyyy', 'en-US') : null);
this.projectForm.controls['dp'].setValue(this.project1.startProduction ? formatDate(this.project1.startProduction, 'MM/dd/yyyy', 'en-US') : null);
this.projectForm.controls['fp'].setValue(this.project1.endProduction ? formatDate(this.project1.endProduction, 'MM/dd/yyyy', 'en-US') : null);
this.projectForm.controls['dcf'].setValue(this.project1.startFc ? formatDate(this.project1.startFc, 'MM/dd/yyyy', 'en-US') : null);
this.projectForm.controls['fcf'].setValue(this.project1.endFc ? formatDate(this.project1.endFc, 'MM/dd/yyyy', 'en-US') : null);
this.projectForm.controls['dl'].setValue(this.project1.startDelivery ? formatDate(this.project1.startDelivery, 'yyyy-MM-dd', 'en-US') : null);
this.projectForm.controls['fl'].setValue(this.project1.endDelivery ? formatDate(this.project1.endDelivery, 'yyyy-MM-dd', 'en-US') : null);
    this.projectForm.controls['drc'].setValue(this.project1.conceptionDuration);
    this.projectForm.controls['cdc'].setValue(this.project1.conceptionComment);
    this.projectForm.controls['drm'].setValue(this.project1.methodeDuration);
    this.projectForm.controls['cdm'].setValue(this.project1.methodeComment);
    this.projectForm.controls['drp'].setValue(this.project1.productionDuration);
    this.projectForm.controls['cdp'].setValue(this.project1.productionComment);
    this.projectForm.controls['drcf'].setValue(this.project1.finalControlDuration);
    this.projectForm.controls['cdcf'].setValue(this.project1.finalControlComment);
    this.projectForm.controls['drl'].setValue(this.project1.deliveryDuration);
    this.projectForm.controls['cdl'].setValue(this.project1.deliveryComment);
    this.projectForm.controls['qte'].setValue(this.project1.qte);
    });
    
  }

  updateproject() {
    const refclient = this.projectForm.get('refc')?.value|| '';
    const refProdelec = this.projectForm.get('refp')?.value|| '';
    const qte = this.projectForm.get('qte')?.value;
    const datelivprev = new Date(formatDate(this.projectForm.get('dlp')?.value,'yyyy-MM-dd','en-US'))||null;
    const durecons = this.projectForm.get('drc')?.value;
    const respcons = this.projectForm.get('rc')?.value || '';
    const comcons = this.projectForm.get('cdc')?.value|| '';
    const duremeth = this.projectForm.get('drm')?.value;
    const resmeth = this.projectForm.get('rm')?.value || '';
    const commeth = this.projectForm.get('cdm')?.value|| '';
    const durepro = this.projectForm.get('drp')?.value;
    const resprod = this.projectForm.get('rp')?.value || '';
    const comprod = this.projectForm.get('cdp')?.value|| '';
    const durecf = this.projectForm.get('drcf')?.value;
    const rescf = this.projectForm.get('rcf')?.value || '';
    const comcf = this.projectForm.get('cdcf')?.value|| '';
    const dureliv = this.projectForm.get('drl')?.value;
    const resliv = this.projectForm.get('rl')?.value || '';
    const comliv = this.projectForm.get('cdl')?.value|| '';

    const dcValue = this.projectForm.get('dc')?.value;
    const fcValue = this.projectForm.get('fc')?.value;
    const dmValue = this.projectForm.get('dm')?.value;
    const fmValue = this.projectForm.get('fm')?.value;
    const dpValue = this.projectForm.get('dp')?.value;
    const fpValue = this.projectForm.get('fp')?.value;
    const dcfValue = this.projectForm.get('dcf')?.value;
    const fcfValue = this.projectForm.get('fcf')?.value;
    const dlValue = this.projectForm.get('dl')?.value;
    const flValue = this.projectForm.get('fl')?.value;

    // Convertir les valeurs en objets Date en vérifiant leur existence
    const debcon = dcValue ? new Date(formatDate(dcValue, 'yyyy-MM-dd', 'en-US')) : null;
    const fincon = fcValue ? new Date(formatDate(fcValue, 'yyyy-MM-dd', 'en-US')) : null;
    const debmeth = dmValue ? new Date(formatDate(dmValue, 'yyyy-MM-dd', 'en-US')) : null;
    const finmeth = fmValue ? new Date(formatDate(fmValue, 'yyyy-MM-dd', 'en-US')) : null;
    const debprod = dpValue ? new Date(formatDate(dpValue, 'yyyy-MM-dd', 'en-US')) : null;
    const finprod = fpValue ? new Date(formatDate(fpValue, 'yyyy-MM-dd', 'en-US')) : null;
    const debcf = dcfValue ? new Date(formatDate(dcfValue, 'yyyy-MM-dd', 'en-US')) : null;
    const fincf = fcfValue ? new Date(formatDate(fcfValue, 'yyyy-MM-dd', 'en-US')) : null;
    const debliv = dlValue ? new Date(formatDate(dlValue, 'yyyy-MM-dd', 'en-US')) : null;
    const finliv = flValue ? new Date(formatDate(flValue, 'yyyy-MM-dd', 'en-US')) : null;
  
    const project: ProjectDto = {
      refClient: refclient,
    refProdelec: refProdelec,
    qte: qte,
    dlp: datelivprev,
    duree: durecons+duremeth+durepro+durecf+dureliv,
    conceptionComment: comcons,
    conceptionDuration: durecons,
    methodeComment: commeth,
    methodeDuration: duremeth,
    productionComment: comprod,
    productionDuration: durepro,
    finalControlComment: comcf,
    finalControlDuration: durecf,
    deliveryComment: comliv,
    startConception: debcon,
    endConception: fincon,
    startMethode: debmeth,
    endMethode: finmeth,
    startProduction: debprod,
    endProduction: finprod,
    startFc: debcf,
    endFc: fincf,
    startDelivery: debliv,
    endDelivery: finliv,
    deliveryDuration: dureliv
    };
    console.log(respcons);
  
    this.projectservice.updateProject(this.project1.idproject,project,respcons,resmeth,resprod,rescf,resliv).subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'Projet modifié',
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
      this.projectForm.reset();
    }, 2000);
    this.projectForm.reset();
    this.submitted = true;
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
        this.projectservice.deleteProject(id).subscribe({
          next: (data) => {
            Swal.fire({
              title: 'Supprimé!',
              text: "Le projet a été supprimé.",
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

  toggleTaskStatus(project: Project, statusField: string) {
    switch (statusField) {
      case 'conceptionStatus':
        this.projectservice.changeStatusConception(project.idproject).subscribe((res:any) => {
          project.conceptionStatus = res.conceptionStatus;
          this.calculateProgress(project);
        });
        break;
      case 'methodeStatus':
        this.projectservice.changeStatusMethode(project.idproject).subscribe((res:any) => {
          project.methodeStatus = res.methodeStatus;
          this.calculateProgress(project);
        });
        break;
      case 'productionStatus':
        this.projectservice.changeStatusProduction(project.idproject).subscribe((res:any) => {
          project.productionStatus = res.productionStatus;
          this.calculateProgress(project);
        });
        break;
      case 'finalControlStatus':
        this.projectservice.changeStatusFC(project.idproject).subscribe((res:any) => {
          project.finalControlStatus = res.finalControlStatus;
          this.calculateProgress(project);
        });
        break;
      case 'deliveryStatus':
        this.projectservice.changeStatusDelivery(project.idproject).subscribe((res:any) => {
          project.deliveryStatus = res.deliveryStatus;
          this.calculateProgress(project);
        });
        break;
    }
  }
  updateConceptionProgress(project: any, event: Event) {
    const newProgress = (event.target as HTMLInputElement).value;
    project.conceptionprogress = parseFloat(newProgress);
    this.projectservice.progressc(project.idproject,parseFloat(newProgress)).subscribe(() => {
      if(parseFloat(newProgress)==100){
      this.projectservice.changeRealc(project.idproject).subscribe(() => {
        this.toggleTaskStatus(project, 'conceptionStatus');
      });
      }
      else{
        this.projectservice.changeStatusConception1(project.idproject).subscribe(() => {
          project.conceptionStatus=false;
          this.calculateProgress(project);
        });
      }
    });
    
    // Vous pouvez également mettre à jour d'autres propriétés liées à la progression ici
  }
  updatemProgress(project: any, event: Event) {
    const newProgress = (event.target as HTMLInputElement).value;
    project.methodeprogress = parseFloat(newProgress);
    this.projectservice.progressm(project.idproject,parseFloat(newProgress)).subscribe(() => {
      if(parseFloat(newProgress)==100){
       
      this.projectservice.changeRealm(project.idproject).subscribe(() => {
        this.toggleTaskStatus(project, 'methodeStatus');
      });
      }
      else{
        this.projectservice.changeStatusMethode1(project.idproject).subscribe(() => {
          project.methodeStatus=false;
          this.calculateProgress(project);
        });
      }
    });
    
    // Vous pouvez également mettre à jour d'autres propriétés liées à la progression ici
  }
  updatepProgress(project: any, event: Event) {
    const newProgress = (event.target as HTMLInputElement).value;
    project.productionprogress = parseFloat(newProgress);
    this.projectservice.progressp(project.idproject,parseFloat(newProgress)).subscribe(() => {
      if(parseFloat(newProgress)==100){
 
      this.projectservice.changeRealp(project.idproject).subscribe(() => {
        this.toggleTaskStatus(project, 'productionStatus');
      });
      }
      else{
        this.projectservice.changeStatusProduction1(project.idproject).subscribe(() => {
          project.productionStatus=false;
          this.calculateProgress(project);
        });
      }
    });
    
    // Vous pouvez également mettre à jour d'autres propriétés liées à la progression ici
  }
  updatefcProgress(project: any, event: Event) {
    const newProgress = (event.target as HTMLInputElement).value;
    project.fcprogress = parseFloat(newProgress);
    this.projectservice.progressfc(project.idproject,parseFloat(newProgress)).subscribe(() => {
      if(parseFloat(newProgress)==100){
      this.projectservice.changeRealfc(project.idproject).subscribe(() => {
        this.toggleTaskStatus(project, 'finalControlStatus');
      });
      }
      else{
        this.projectservice.changeStatusFC1(project.idproject).subscribe(() => {
          project.finalControlStatus=false;
          this.calculateProgress(project);
        });
      }
    });
    
    // Vous pouvez également mettre à jour d'autres propriétés liées à la progression ici
  }
  updatedProgress(project: any, event: Event) {
    const newProgress = (event.target as HTMLInputElement).value;
    project.deliveryprogress = parseFloat(newProgress);
    this.projectservice.progressd(project.idproject,parseFloat(newProgress)).subscribe(() => {
      if(parseFloat(newProgress)==100){
      this.projectservice.changeReall(project.idproject).subscribe(() => {
        this.toggleTaskStatus(project, 'deliveryStatus');
      });
      }
      else{
        this.projectservice.changeStatusDelivery1(project.idproject).subscribe(() => {
          project.deliveryStatus=false;
          this.calculateProgress(project);
        });
      }
    });
    
    // Vous pouvez également mettre à jour d'autres propriétés liées à la progression ici
  }

  applySearchFilter(): void {
    console.log('Search term:', this.searchTerm);
    if (this.searchTerm) {
      this.flist = this.list.filter(project =>
        this.filterByCategory(project)
      );
    } else {
      this.flist = this.list;
    }
    console.log('Filtered transactions:', this.flist);
  }

  filterByCategory(project: any): boolean {
    return project.order.user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) || project.refClient.toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  addproject() {
  // Validation simple du formulaire
  if (this.projectsForm.invalid) {
    Swal.fire({
      icon: 'error',
      title: 'Formulaire invalide',
      text: 'Veuillez remplir tous les champs obligatoires correctement.',
    });
    return;
  }

  // Récupération des valeurs du formulaire
  const qte = this.projectsForm.get('qte')?.value;
  const datelivprev = this.projectsForm.get('dlp')?.value;

  // Conversion des dates en objets Date ou null
  const debcon = this.projectsForm.get('dc')?.value ? new Date(formatDate(this.projectsForm.get('dc')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const fincon = this.projectsForm.get('fc')?.value ? new Date(formatDate(this.projectsForm.get('fc')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const debmeth = this.projectsForm.get('dm')?.value ? new Date(formatDate(this.projectsForm.get('dm')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const finmeth = this.projectsForm.get('fm')?.value ? new Date(formatDate(this.projectsForm.get('fm')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const debprod = this.projectsForm.get('dp')?.value ? new Date(formatDate(this.projectsForm.get('dp')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const finprod = this.projectsForm.get('fp')?.value ? new Date(formatDate(this.projectsForm.get('fp')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const debcf = this.projectsForm.get('dcf')?.value ? new Date(formatDate(this.projectsForm.get('dcf')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const fincf = this.projectsForm.get('fcf')?.value ? new Date(formatDate(this.projectsForm.get('fcf')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const debliv = this.projectsForm.get('dl')?.value ? new Date(formatDate(this.projectsForm.get('dl')?.value, 'yyyy-MM-dd', 'en-US')) : null;
  const finliv = this.projectsForm.get('fl')?.value ? new Date(formatDate(this.projectsForm.get('fl')?.value, 'yyyy-MM-dd', 'en-US')) : null;

  // Récupération des durées, en s'assurant qu'elles sont des nombres valides (sinon 0)
  const durecons = Number(this.projectsForm.get('drc')?.value) || 0;
  const duremeth = Number(this.projectsForm.get('drm')?.value) || 0;
  const durepro = Number(this.projectsForm.get('drp')?.value) || 0;
  const durecf = Number(this.projectsForm.get('drcf')?.value) || 0;
  const dureliv = Number(this.projectsForm.get('drl')?.value) || 0;

  // Récupération des commentaires
  const comcons = this.projectsForm.get('cdc')?.value || '';
  const commeth = this.projectsForm.get('cdm')?.value || '';
  const comprod = this.projectsForm.get('cdp')?.value || '';
  const comcf = this.projectsForm.get('cdcf')?.value || '';
  const comliv = this.projectsForm.get('cdl')?.value || '';

  // Récupération des responsables, en nettoyant les valeurs vides
  const respcons = (this.projectsForm.get('rc')?.value || '').trim() || undefined;
  const resmeth = (this.projectsForm.get('rm')?.value || '').trim() || undefined;
  const resprod = (this.projectsForm.get('rp')?.value || '').trim() || undefined;
  const rescf = (this.projectsForm.get('rcf')?.value || '').trim() || undefined;
  const resliv = (this.projectsForm.get('rl')?.value || '').trim() || undefined;

  // Construction de l'objet ProjectDto
  const project: ProjectDto = {
    refClient: this.project.refClient,
    refProdelec: this.project.refProdelec,
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

  // Appel du service pour créer le projet
  this.projectservice.createProject(project, this.project.order.idOrder, respcons, resmeth, resprod, rescf, resliv).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Projet ajouté',
        showConfirmButton: false,
        timer: 1500
      });
      location.reload();
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

  // Fermeture de la modale et reset du formulaire
  this.showModala?.hide();
  setTimeout(() => {
    this.projectsForm.reset();
  }, 2000);
  this.projectsForm.reset();
  this.submitted = true;
}


  isDateOverdue(dlp: Date,p:Project): boolean {
    const today = new Date();
    if (dlp == null) {
      return false;
    }
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dlpWithoutTime = new Date(new Date(dlp).getFullYear(), new Date(dlp).getMonth(), new Date(dlp).getDate());
    return todayWithoutTime > dlpWithoutTime && p.progress !=100;
  }
  
  isDateOverdue1(df: Date, drf: Date): boolean {
    if (df == null || drf == null) {
      return false;
    }
    const dfWithoutTime = new Date(new Date(df).getFullYear(), new Date(df).getMonth(), new Date(df).getDate());
    const drfWithoutTime = new Date(new Date(drf).getFullYear(), new Date(drf).getMonth(), new Date(drf).getDate());
    return dfWithoutTime < drfWithoutTime;
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
        this.projectservice.archivera(id).subscribe({
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

  sortByDate() {
    this.isAscending = !this.isAscending;
    this.flist.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  sortByQuantity() {
    this.isAscending = !this.isAscending;
    this.flist.sort((a, b) => {
      return this.isAscending ? a.qte - b.qte : b.qte - a.qte;
    });
  }

  sortByProgress() {
    this.isAscending = !this.isAscending;
    this.flist.sort((a, b) => {
      return this.isAscending ? a.progress - b.progress : b.progress - a.progress;
    });
  }

  sortByDeliveryDate() {
    this.isAscending = !this.isAscending;
    this.flist.sort((a, b) => {
      const dateA = new Date(a.dlp).getTime();
      const dateB = new Date(b.dlp).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  onYearChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedYear === 'Tous') {
      this.flist = this.list;
    } else {
      this.flist = this.list.filter(project => {
        const year = new Date(project.createdAt).getFullYear().toString();
        return year === this.selectedYear;
      });
    }
  }

  getUniqueYears(): string[] {
    const years = this.list.map(project => new Date(project.createdAt).getFullYear().toString());
    return ['Tous', ...Array.from(new Set(years))];
  }

  setDisplayMode(mode: 'table' | 'grid') { this.displayMode = mode; }


   toggleSection(modal: 'add' | 'edit', section: string) {
  if (modal === 'add') {
    switch (section) {
      case 'conception': this.showConceptionAdd = !this.showConceptionAdd; break;
      case 'methode': this.showMethodeAdd = !this.showMethodeAdd; break;
      case 'production': this.showProductionAdd = !this.showProductionAdd; break;
      case 'controle': this.showControleAdd = !this.showControleAdd; break;
      case 'livraison': this.showLivraisonAdd = !this.showLivraisonAdd; break;
    }
  } else if (modal === 'edit') {
    switch (section) {
      case 'conception': this.showConceptionEdit = !this.showConceptionEdit; break;
      case 'methode': this.showMethodeEdit = !this.showMethodeEdit; break;
      case 'production': this.showProductionEdit = !this.showProductionEdit; break;
      case 'controle': this.showControleEdit = !this.showControleEdit; break;
      case 'livraison': this.showLivraisonEdit = !this.showLivraisonEdit; break;
    }
  }
}


hasEditPermission(project: any): boolean {
  return (this.userr && 
         (project.conceptionResponsible?.id === this.userr.id || 
          project.methodeResponsible?.id === this.userr.id || 
          project.productionResponsible?.id === this.userr.id || 
          project.finalControlResponsible?.id === this.userr.id || 
          project.deliveryResponsible?.id === this.userr.id)) || 
         this.userr.role?.name === 'SUBADMIN';
}

hasPhasePermission(phase: string, project: any): boolean {
  const responsibleField = `${phase}Responsible`;
  return (this.userr && project[responsibleField]?.id === this.userr.id) || 
         this.userr?.role?.name === 'SUBADMIN';
}
}