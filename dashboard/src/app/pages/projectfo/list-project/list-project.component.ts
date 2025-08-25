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
import { ProjectAddModalComponent } from '../modals/project-add-modal/project-add-modal.component';
import { ProjectEditModalComponent } from '../modals/project-edit-modal/project-edit-modal.component';
import { ProjectPhaseDetailsModalComponent } from '../modals/project-phase-details-modal/project-phase-details-modal.component';
import { WorkflowPhase } from '../../workflow-discussion/models/workflow-phase.model';
import { CookieService } from 'ngx-cookie-service';

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

  
  constructor(private workersService: WorkersService,
        private userStateService: UserStateService,
          private cookieService: CookieService,
    private router: Router, private orderservice: OrderServiceService, private projectservice: ProjectService, private formBuilder: UntypedFormBuilder,private modalService: BsModalService) {
  }

  ngOnInit() {
 const savedMode = this.cookieService.get('displayModeWo');
    this.displayMode = (savedMode === 'table' || savedMode === 'grid') ? savedMode : 'grid';

this.userStateService.user$.subscribe(user => {
      this.userr = user;
    });

    this.loadProjects()


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

  


loadProjects(){
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

  setDisplayMode(mode: 'table' | 'grid') {
    this.displayMode = mode;
    this.cookieService.set('displayModeWo', mode, 365); // save for 1 year
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
      this.loadProjects();
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
      this.loadProjects();
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

  // Rafraîchir la liste des projets
  refreshProjects() {
    this.projectservice.getAllProjects().subscribe({
      next: (data) => {
        this.list = data.filter(p => !p.archivera);
        this.flist = [...this.list];
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de rafraîchir les projets', 'error');
      }
    });
  }
}