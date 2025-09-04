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
import { defineLocale, frLocale } from 'ngx-bootstrap/chronos';
import { ProjectPhaseDetailsModalComponent } from '../projectfo/modals/project-phase-details-modal/project-phase-details-modal.component';
import { ProjectEditModalComponent } from '../projectfo/modals/project-edit-modal/project-edit-modal.component';
import { ProjectAddModalComponent } from '../projectfo/modals/project-add-modal/project-add-modal.component';

defineLocale('fr', frLocale);
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
    this.route.paramMap.subscribe(params => {
  const idParam = params.get('id');
  if (!idParam || isNaN(+idParam)) {
    this.errorMessage = 'ID de projet invalide';
    this.loading = false;
    return;
  }
  this.projectId = +idParam;
  this.loading = true;
  this.projectService.getProjectById(this.projectId).subscribe({
    next: (data) => {
      this.project = data;
      this.loading = false;
      this.errorMessage = '';
      console.log(data.refProdelec)
    },
    error: (err) => {
      this.errorMessage = 'Erreur lors du chargement du projet';
      this.loading = false;
      console.error(err);
    }
  });
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
        this.projectService.archiverc(projectId).subscribe(() => {
          Swal.fire('Archivé !', 'Le projet a été archivé.', 'success');
          this.router.navigate(['/listproject']);
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



// Méthodes pour ouvrir les nouvelles modales
   openAddModal(project: Project) {
    this.modalRef = this.modalService.show(ProjectAddModalComponent, {
      initialState: { project, listr: this.listr },
      class: 'modal-xl'
    });

    this.modalRef.content.modalClosed.subscribe(() => {
      this.modalRef?.hide();
    });

    this.modalRef.content.projectAdded.subscribe(() => {
      this.modalRef?.hide();
    });
  }

  openEditModal(project: Project) {
    this.modalRef = this.modalService.show(ProjectEditModalComponent, {
      initialState: { project, listr: this.listr },
      class: 'modal-xl'
    });

    this.modalRef.content.modalClosed.subscribe(() => {
      this.modalRef?.hide();
    });

    this.modalRef.content.projectUpdated.subscribe(() => {
      this.modalRef?.hide();
    });
  }

  openPhaseDetailsModal(project: Project, phase: any) {
    this.modalService.show(ProjectPhaseDetailsModalComponent, {
      initialState: {
        project: project,
        phase: phase
      },
      class: 'modal-md'
    });
  }
}
