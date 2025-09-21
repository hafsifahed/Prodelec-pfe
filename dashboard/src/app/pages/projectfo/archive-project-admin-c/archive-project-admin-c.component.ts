import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Project } from 'src/app/core/models/projectfo/project';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-archive-project-admin-c',
  templateUrl: './archive-project-admin-c.component.html',
  styleUrls: ['./archive-project-admin-c.component.scss']
})
export class ArchiveProjectAdminCComponent {
  list: Project[] = [];
  flist: Project[] = [];
  searchTerm: string;
  p: number = 1; // Current page number
  itemsPerPage: number = 3;

  constructor(
    private router: Router,
    private orderservice: OrderServiceService,
    private projectservice: ProjectService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit() {
    this.projectservice.getArchiveByUserRole().subscribe({
      next: (data) => {
        if (data.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de projets archivés',
          });
        } else {
          console.log('archive', data);
          // Service already returns archived projects filtered by role, so no need to filter again
          this.list = data;
          this.flist = data;
          console.log('archive list', this.list);
          console.log('archive flist', this.flist);
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Il y a un problème!',
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
    console.log('Filtered projects:', this.flist);
  }

  filterByCategory(project: Project): boolean {
    if (!project.order || !project.order.orderName) return false;
    return project.order.orderName.toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  delete(id: number) {
    Swal.fire({
      title: 'Vous êtes sûr ?',
      text: "Vous ne pouvez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui !',
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectservice.deleteProject(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé !',
              text: "Le projet a été supprimé.",
              icon: 'success',
            });
            location.reload();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Il y a un problème!',
            });
          },
        });
      }
    });
  }

  restaurer(id: number) {
    Swal.fire({
      title: 'Vous êtes sûr ?',
      text: "Vous ne pouvez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui !',
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectservice.archiverc(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Restauré !',
              text: "Le projet a été restauré.",
              icon: 'success',
            });
            location.reload();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Il y a un problème!',
            });
          },
        });
      }
    });
  }
}
