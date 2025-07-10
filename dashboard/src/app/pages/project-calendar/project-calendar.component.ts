import { Component, OnInit, TemplateRef, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { Project } from 'src/app/core/models/projectfo/project';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';

import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-project-calendar',
  templateUrl: './project-calendar.component.html',
  styleUrls: ['./project-calendar.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class ProjectCalendarComponent implements OnInit, OnDestroy {

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: [],
    editable: false,
    selectable: false,
    eventClick: this.handleEventClick.bind(this)
  };

  private STEP_COLORS = {
    conception: '#1E90FF',
    methode: '#32CD32',
    production: '#FFA500',
    controleFinal: '#FF4500',
    livraison: '#800080'
  };

  projects: any[] = [];
  modalRef?: BsModalRef;
  selectedProject!: Project;
  selectedStep: string = '';
  userr: User | null = null;

  title = 'Calendrier'; // Ajouté pour le breadcrumb si tu en utilises un

  breadcrumbItems = [ // Ajouté pour le breadcrumb si tu en utilises un
    { label: 'Accueil', active: false },
    { label: 'Calendrier', active: true }
  ];

  private progressUpdateSubject = new Subject<{ project: Project, step: string, value: number }>();
  private progressUpdateSubscription?: Subscription;

  @ViewChild('detailsModal') detailsModal?: TemplateRef<any>;

  constructor(
    private projectService: ProjectService,
    private userStateService: UserStateService,
    private modalService: BsModalService
  ) {
    this.userStateService.user$.subscribe(user => { this.userr = user; });
  }

  ngOnInit(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects: Project[]) => {
        this.projects = projects.filter(p => !p.archivera);
        this.loadEvents();
      },
      error: (err) => {
        Swal.fire('Erreur', 'Erreur lors du chargement des projets', 'error');
        console.error(err);
      }
    });

    // Abonnement avec debounce de 300ms sur les mises à jour de progression
    this.progressUpdateSubscription = this.progressUpdateSubject.pipe(
      debounceTime(300)
    ).subscribe(({ project, step, value }) => {
      this.callUpdateProgress(project, step, value);
    });
  }

  ngOnDestroy(): void {
    this.progressUpdateSubscription?.unsubscribe();
  }

  private toDate(value: any): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  loadEvents() {
  const events = [];
  const today = new Date();

  this.projects.forEach(proj => {
    const steps = [
      { key: 'conception', start: proj.startConception, end: proj.endConception, responsible: proj.conceptionResponsible, progress: proj.conceptionprogress, status: proj.conceptionStatus },
      { key: 'methode', start: proj.startMethode, end: proj.endMethode, responsible: proj.methodeResponsible, progress: proj.methodeprogress, status: proj.methodeStatus },
      { key: 'production', start: proj.startProduction, end: proj.endProduction, responsible: proj.productionResponsible, progress: proj.productionprogress, status: proj.productionStatus },
      { key: 'controleFinal', start: proj.startFc, end: proj.endFc, responsible: proj.finalControlResponsible, progress: proj.fcprogress, status: proj.finalControlStatus },
      { key: 'livraison', start: proj.startDelivery, end: proj.endDelivery, responsible: proj.deliveryResponsible, progress: proj.deliveryprogress, status: proj.deliveryStatus },
    ];

    steps.forEach(step => {
      const start = this.toDate(step.start);
      const end = this.toDate(step.end);

      if (!start || !end) return;

      // Condition : utilisateur est responsable de l'étape OU est le client du projet
      const isResponsible = step.responsible && this.userr && step.responsible.id === this.userr.id;
      const isClient = this.userr && proj.order.user.username === this.userr.username; // ou autre propriété identifiant client

      if (!isResponsible && !isClient) return;

      let titleStatus = '';
      let color = this.STEP_COLORS[step.key as keyof typeof this.STEP_COLORS];

      if (end < today && step.progress < 100) {
        titleStatus = ' (En retard)';
        color = '#dc3545'; // rouge
      } else if (step.status === true || step.progress === 100) {
        titleStatus = ' (Terminé)';
        color = '#28a745'; // vert
      } else if (step.progress > 0) {
        titleStatus = ' (En cours)';
        color = '#ffc107'; // jaune
      } else {
        color = '#6c757d'; // gris
      }

      events.push({
        id: `${proj.idproject}-${step.key}`,
        title: `${this.capitalizeFirstLetter(step.key)} - ${proj.refClient}${titleStatus}`,
        start: start.toISOString(),
        end: end.toISOString(),
        color: color,
        extendedProps: {
          project: proj,
          step: step.key
        }
      });
    });
  });

  this.calendarOptions = {
    ...this.calendarOptions,
    events
  };
}





  handleEventClick(clickInfo: EventClickArg) {
    this.selectedProject = clickInfo.event.extendedProps.project;
    this.selectedStep = clickInfo.event.extendedProps.step;
    this.modalRef = this.modalService.show(this.detailsModal!, { class: 'modal-lg' });
  }

  capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    if (str === 'controleFinal') return 'Contrôle final';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  get stepComment(): string | null {
    if (!this.selectedProject || !this.selectedStep) return null;
    const prop = this.selectedStep + 'Comment';
    return (this.selectedProject as any)[prop] || null;
  }

  get stepDuration(): number | null {
    if (!this.selectedProject || !this.selectedStep) return null;
    const prop = this.selectedStep + 'Duration';
    return (this.selectedProject as any)[prop] || null;
  }

  get stepProgress(): number {
    if (!this.selectedProject || !this.selectedStep) return 0;
    const prop = this.selectedStep + 'progress';
    return (this.selectedProject as any)[prop] || 0;
  }

  get stepResponsible(): User | null {
    if (!this.selectedProject || !this.selectedStep) return null;
    const prop = this.selectedStep + 'Responsible';
    const value = (this.selectedProject as any)[prop];
    if (value && typeof value === 'object' && 'id' in value) {
      return value as User;
    }
    return null;
  }

  get stepStartDate(): Date | null {
    if (!this.selectedProject || !this.selectedStep) return null;
    const prop = 'start' + this.selectedStep.charAt(0).toUpperCase() + this.selectedStep.slice(1);
    return this.toDate((this.selectedProject as any)[prop]);
  }

  get stepEndDate(): Date | null {
    if (!this.selectedProject || !this.selectedStep) return null;
    const prop = 'end' + this.selectedStep.charAt(0).toUpperCase() + this.selectedStep.slice(1);
    return this.toDate((this.selectedProject as any)[prop]);
  }

  canEditProgress(): boolean {
    if (!this.userr || !this.selectedProject || !this.selectedStep) return false;

    if (this.userr.role?.name === 'SUBADMIN' || this.userr.role?.name === 'ADMIN') {
      return true;
    }

    const responsible = this.stepResponsible;
    return responsible?.id === this.userr.id;
  }

  // Méthode appelée à chaque mouvement du slider (input event)
  onProgressInput(project: Project, step: string, event: Event) {
    const newProgress = +(event.target as HTMLInputElement).value;
    // Mise à jour locale immédiate
    (project as any)[`${step}progress`] = newProgress;
    // Emission dans le Subject avec debounce
    this.progressUpdateSubject.next({ project, step, value: newProgress });
  }

  // Méthode appelée après debounceTime pour faire l'appel HTTP
  private callUpdateProgress(project: Project, step: string, newProgress: number) {
  let progressApi: Function | undefined;

  switch (step) {
    case 'conception': progressApi = this.projectService.progressc.bind(this.projectService); break;
    case 'methode': progressApi = this.projectService.progressm.bind(this.projectService); break;
    case 'production': progressApi = this.projectService.progressp.bind(this.projectService); break;
    case 'controleFinal': progressApi = this.projectService.progressfc.bind(this.projectService); break;
    case 'livraison': progressApi = this.projectService.progressd.bind(this.projectService); break;
    default: return;
  }

  if (progressApi) {
    progressApi(project.idproject, newProgress).subscribe(() => {
      // Mise à jour locale
      (project as any)[`${step}progress`] = newProgress;

      // Mettre à jour le statut (exemple pour conception)
      const statusField = this.getStatusFieldName(step);
      if (newProgress === 100) {
        (project as any)[statusField] = true; // terminé
      } else if (newProgress > 0) {
        (project as any)[statusField] = false; // en cours
      } else {
        (project as any)[statusField] = false; // pas commencé
      }

      // Recharger les événements pour refléter les changements
      this.loadEvents();

      Swal.fire('Succès', `Progression ${step} mise à jour à ${newProgress}%`, 'success');
    }, (error: any) => {
      Swal.fire('Erreur', 'Erreur lors de la mise à jour', 'error');
      console.error(error);
    });
  }
}

private getStatusFieldName(step: string): string {
  switch (step) {
    case 'conception': return 'conceptionStatus';
    case 'methode': return 'methodeStatus';
    case 'production': return 'productionStatus';
    case 'controleFinal': return 'finalControlStatus';
    case 'livraison': return 'deliveryStatus';
    default: return '';
  }
}

}
