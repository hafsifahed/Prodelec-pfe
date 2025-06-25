import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../core/models/projectfo/project';
import { ProjectService } from '../core/services/projectService/project.service';
import { UserStateService } from '../core/services/user-state.service';

@Component({
  selector: 'app-projet-detail',
  templateUrl: './projet-detail.component.html',
  styleUrls: ['./projet-detail.component.scss']
})
export class ProjetDetailComponent implements OnInit {
  projectId!: number;
  project?: Project;
  loading = true;
  errorMessage = '';
  userr: any = [] // À adapter selon ton auth

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private router: Router,
        private userStateService: UserStateService
  ) {}

  ngOnInit(): void {
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
    this.userStateService.user$.subscribe(user => {
      this.userr = user;
    });
  }

  editModal(projectId: number) {
    this.router.navigate(['/edit-project', projectId]);
  }

  delete(projectId: number) {
    if (confirm('Voulez-vous vraiment supprimer ce projet ?')) {
      this.projectService.deleteProject(projectId).subscribe(() => {
        alert('Projet supprimé');
        this.router.navigate(['/projects']);
      });
    }
  }

  archive(projectId: number) {
    if (confirm('Archiver ce projet ?')) {
      this.projectService.archivera(projectId).subscribe(() => {
        alert('Projet archivé');
        this.router.navigate(['/projects']);
      });
    }
  }

  addModal(project: any) {
    const newProject = { ...project, id: undefined }; // Retire l'ID pour dupliquer
    this.projectService.createProject(newProject as any, project.order.id).subscribe(() => {
      alert('Projet dupliqué');
      this.router.navigate(['/projects']);
    });
  }

  updateConceptionProgress(project: Project, event: any) {
    const value = event.target.value;
    this.projectService.progressc(project.idproject, value).subscribe(() => {
      if (this.project) this.project.conceptionprogress = value;
    });
  }
  updatemProgress(project: Project, event: any) {
    const value = event.target.value;
    this.projectService.progressm(project.idproject, value).subscribe(() => {
      if (this.project) this.project.methodeprogress = value;
    });
  }
  updatepProgress(project: Project, event: any) {
    const value = event.target.value;
    this.projectService.progressp(project.idproject, value).subscribe(() => {
      if (this.project) this.project.productionprogress = value;
    });
  }
  updatefcProgress(project: Project, event: any) {
    const value = event.target.value;
    this.projectService.progressfc(project.idproject, value).subscribe(() => {
      if (this.project) this.project.fcprogress = value;
    });
  }
  updatedProgress(project: Project, event: any) {
    const value = event.target.value;
    this.projectService.progressd(project.idproject, value).subscribe(() => {
      if (this.project) this.project.deliveryprogress = value;
    });
  }

  isDateOverdue(date: string, project: Project): boolean {
    if (!date) return false;
    const d = new Date(date);
    return d < new Date() && project.progress < 100;
  }
  isDateOverdue1(end: string, realend: string): boolean {
    if (!end || !realend) return false;
    return new Date(realend) > new Date(end);
  }
}
