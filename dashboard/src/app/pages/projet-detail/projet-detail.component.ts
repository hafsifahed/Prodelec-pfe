import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../core/models/projectfo/project';
import { ProjectService } from '../../core/services/projectService/project.service';
import { UserStateService } from '../../core/services/user-state.service';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OrderServiceService } from '../../core/services/orderService/order-service.service';
import { formatDate } from '@angular/common';
import { ProjectDto } from '../../core/models/projectfo/project-dto';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-projet-detail',
  templateUrl: './projet-detail.component.html',
  styleUrls: ['./projet-detail.component.scss']
})
export class ProjetDetailComponent implements OnInit,OnDestroy {
  projectId!: number;
  project?: any;
  loading = true;
  errorMessage = '';
  userr: any = [];
  submitted = false;
  modalRef?: BsModalRef;
  projectsForm!: UntypedFormGroup;
  projectForm!: UntypedFormGroup;
  listr:any[]=[];
  project1:any;
  project2:Project;

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
  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private modalService: BsModalService,
    private projectservice: ProjectService,
    private orderservice: OrderServiceService,
    private userStateService: UserStateService
    
  ) {}

  ngOnInit(): void {
        this.userStateService.user$.subscribe(user => {
          this.userr = user;
        });
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.projectId)) {
      this.errorMessage = 'ID de projet invalide';
      this.loading = false;
      return;
    }
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (data) => {
        this.project = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement du projet';
        this.loading = false;
        console.error(err);
      }
    });

        this.projectsForm = this.formBuilder.group({
          dlp: ['', [Validators.required]],
          drc: [0, [Validators.required]],
          cdc: ['', [Validators.required]],
          rc: ['', [Validators.required]],
          drm: [0, [Validators.required]],
          cdm: ['', [Validators.required]],
          rm: ['', [Validators.required]],
          drp: [0, [Validators.required]],
          cdp: ['', [Validators.required]],
          rp: ['', [Validators.required]],
          drcf: [0, [Validators.required]],
          cdcf: ['', [Validators.required]],
          rcf: ['', [Validators.required]],
          drl: [0, [Validators.required]],
          cdl: ['', [Validators.required]],
          rl: ['', [Validators.required]],
          dc: ['', [Validators.required]],
          fc: ['', [Validators.required]],
          dm: ['', [Validators.required]],
          fm: ['', [Validators.required]],
          dp: ['', [Validators.required]],
          fp: ['', [Validators.required]],
          dcf: ['', [Validators.required]],
          fcf: ['', [Validators.required]],
          dl: ['', [Validators.required]],
          fl: ['', [Validators.required]],
          qte: ['', [Validators.required]]
        });
    
        this.projectForm = this.formBuilder.group({
          refc: ['', [Validators.required]],
          refp: ['', [Validators.required]],
          dlp: ['', [Validators.required]],
          drc: [0, [Validators.required]],
          cdc: ['', [Validators.required]],
          rc: ['', [Validators.required]],
          drm: [0, [Validators.required]],
          cdm: ['', [Validators.required]],
          rm: ['', [Validators.required]],
          drp: [0, [Validators.required]],
          cdp: ['', [Validators.required]],
          rp: ['', [Validators.required]],
          drcf: [0, [Validators.required]],
          cdcf: ['', [Validators.required]],
          rcf: ['', [Validators.required]],
          drl: [0, [Validators.required]],
          cdl: ['', [Validators.required]],
          rl: ['', [Validators.required]],
          dc: ['', [Validators.required]],
          fc: ['', [Validators.required]],
          dm: ['', [Validators.required]],
          fm: ['', [Validators.required]],
          dp: ['', [Validators.required]],
          fp: ['', [Validators.required]],
          dcf: ['', [Validators.required]],
          fcf: ['', [Validators.required]],
          dl: ['', [Validators.required]],
          fl: ['', [Validators.required]],
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

  // Ouvre la modale de duplication
  addModal(project: any) {
    this.submitted = false;
    this.project = project;
    this.showModala?.show();
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

  editModal(id: any) {
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

  // Confirme la duplication et crée le projet
  confirmDuplicate() {
    if (!this.project) return;
    const newProject = { ...this.project, id: undefined, idproject: undefined }; // Retire l'ID pour dupliquer
    this.projectService.createProject(newProject, this.project.order.id).subscribe(() => {
      Swal.fire('Succès', 'Projet dupliqué !', 'success');
      this.showModala?.hide();
      this.router.navigate(['/projects']);
    }, () => {
      Swal.fire('Erreur', 'La duplication a échoué.', 'error');
    });
  }

  // Suppression avec confirmation SweetAlert
  delete(projectId: number) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deleteProject(projectId).subscribe(() => {
          Swal.fire('Supprimé !', 'Le projet a été supprimé.', 'success');
          this.router.navigate(['/projects']);
        }, () => {
          Swal.fire('Erreur', 'La suppression a échoué.', 'error');
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

  // Archivage avec confirmation SweetAlert
  archive(projectId: number) {
    Swal.fire({
      title: 'Archiver ce projet ?',
      text: 'Vous pourrez le retrouver dans les archives.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, archiver',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.archivera(projectId).subscribe(() => {
          Swal.fire('Archivé !', 'Le projet a été archivé.', 'success');
          this.router.navigate(['/projects']);
        }, () => {
          Swal.fire('Erreur', 'L\'archivage a échoué.', 'error');
        });
      }
    });
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

  addproject() {
      const qte = this.projectsForm.get('qte')?.value;
      const datelivprev = this.projectsForm.get('dlp')?.value;
      const debcon = this.projectsForm.get('dc')?.value;
      const fincon = this.projectsForm.get('fc')?.value;
      const debmeth = this.projectsForm.get('dm')?.value;
      const finmeth = this.projectsForm.get('fm')?.value;
      const debprod = this.projectsForm.get('dp')?.value;
      const finprod = this.projectsForm.get('fp')?.value;
      const debcf = this.projectsForm.get('dcf')?.value;
      const fincf = this.projectsForm.get('fcf')?.value;
      const dlValue = this.projectsForm.get('dl')?.value;
  const flValue = this.projectsForm.get('fl')?.value;
  
  const debliv = dlValue ? new Date(formatDate(dlValue, 'yyyy-MM-dd', 'en-US')) : null;
  const finliv = flValue ? new Date(formatDate(flValue, 'yyyy-MM-dd', 'en-US')) : null;
      const durecons = this.projectsForm.get('drc')?.value;
      const respcons = this.projectsForm.get('rc')?.value || '';
      const comcons = this.projectsForm.get('cdc')?.value;
      const duremeth = this.projectsForm.get('drm')?.value;
      const resmeth = this.projectsForm.get('rm')?.value || '';
      const commeth = this.projectsForm.get('cdm')?.value;
      const durepro = this.projectsForm.get('drp')?.value;
      const resprod = this.projectsForm.get('rp')?.value || '';
      const comprod = this.projectsForm.get('cdp')?.value;
      const durecf = this.projectsForm.get('drcf')?.value;
      const rescf = this.projectsForm.get('rcf')?.value || '';
      const comcf = this.projectsForm.get('cdcf')?.value;
      const dureliv = this.projectsForm.get('drl')?.value;
      const resliv = this.projectsForm.get('rl')?.value || '';
      const comliv = this.projectsForm.get('cdl')?.value;
    
      const project: ProjectDto = {
        refClient: this.project.refClient,
      refProdelec: this.project.refProdelec,
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
      console.log(respcons);
    
      this.projectservice.createProject(project,this.project.order.idOrder,respcons,resmeth,resprod,rescf,resliv).subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Projet ajouté',
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
}
