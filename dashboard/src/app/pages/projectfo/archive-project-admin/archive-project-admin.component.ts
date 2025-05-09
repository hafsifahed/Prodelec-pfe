import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Project } from 'src/app/core/models/projectfo/project';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-archive-project-admin',
  templateUrl: './archive-project-admin.component.html',
  styleUrls: ['./archive-project-admin.component.scss']
})
export class ArchiveProjectAdminComponent {
  list: Project[] = [];
  flist: Project[] = [];
  search!: string;
  completedDuration = 0;
  progress: number = 0;
  searchTerm: string ;
  submitted = false;
  project:any;
  project1:Project;
  p: number = 1; // Current page number
  itemsPerPage: number = 3;
  constructor(private router: Router, private orderservice: OrderServiceService, private projectservice: ProjectService, private formBuilder: UntypedFormBuilder) {
  }
  ngOnInit() {
    this.projectservice.getAllProjects().subscribe({
      next: (data) => {
        if (data.length == 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de projets',
          });
        } else {
          this.list = data.filter((project) => project.archivera);
          this.flist=data.filter((project) => project.archivera);
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
    return project.order.orderName.toLowerCase().includes(this.searchTerm.toLowerCase());
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

  restaurer(id: number) {
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
              title: 'Restauré!',
              text: "Le projet a été Restauré.",
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
}
