import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/core/models/auth.models';
import { Project } from 'src/app/core/models/projectfo/project';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { UsersService } from 'src/app/core/services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-projet-user-admin',
  templateUrl: './list-projet-user-admin.component.html',
  styleUrls: ['./list-projet-user-admin.component.scss']
})
export class ListProjetUserAdminComponent {
  list: Project[] = [];
  flist: Project[] = [];
  search!: string;
  completedDuration = 0;
  progress: number = 0;
  searchTerm: string ;
  submitted = false;
  project:any;
  project1:Project;
  isAscending: boolean = true;
  selectedYear: string = 'Tous'; 
  p: number = 1; // Current page number
  itemsPerPage: number = 3;
  user: User | null = null;
  errorMessage: string;
  displayMode: 'table' | 'grid' = 'grid'; // par défaut en mode tableau

  constructor(private router: Router, private orderservice: OrderServiceService,
        private userStateService: UserStateService, 
    private projectservice: ProjectService, private formBuilder: UntypedFormBuilder,private usersService : UsersService) {
  }
  ngOnInit() {
this.userStateService.user$.subscribe(user => {
      this.user = user;
    });

      this.loadProject(this.user);

  }


  loadProject(user: User): void {
    this.list = [];
    this.flist = [];
  
    this.projectservice.getProjectsByPartner(user.partner.id).subscribe({
      next: (data: any) => {
        console.log('projects : '+data)
        if (data.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de projets',
          });
        } else {
          this.list = this.filterProjects(data, user);
          this.flist = this.filterProjects(data, user, true);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets :', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Il y a un problème !',
        });
      },
    });
  }
  
  filterProjects(projects: any[], user: User, withLog: boolean = false): any[] {
    return projects.filter((project) => {
      const isNotArchived = !project.archiverc;
      const partnerMatches = project.order.user.partner.name === user.partner.name;
      if (withLog) {
        console.log('Project partner:', project.order.user.partner.name);
        console.log('User partner:', user.partner.name);
      }
      return isNotArchived && partnerMatches;
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
        this.projectservice.archiverc(id).subscribe({
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

  setDisplayMode(mode: 'table' | 'grid') {
  this.displayMode = mode;
}
}
