import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Project } from 'src/app/core/models/projectfo/project';
import { UserModel } from 'src/app/core/models/user.models';
import { OrderServiceService } from 'src/app/core/services/orderService/order-service.service';
import { ProjectService } from 'src/app/core/services/projectService/project.service';
import { UsersService } from 'src/app/core/services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-archive-project-user',
  templateUrl: './archive-project-user.component.html',
  styleUrls: ['./archive-project-user.component.scss']
})
export class ArchiveProjectUserComponent {
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
  user: UserModel | null = null;
  errorMessage: string;
  userEmail = localStorage.getItem('userMail') || '';
  constructor(private router: Router, private orderservice: OrderServiceService, private projectservice: ProjectService, private formBuilder: UntypedFormBuilder,private usersService : UsersService) {
  }
  ngOnInit() {
    if (this.userEmail) {
      this.fetchUser(this.userEmail);
      
    }
    

  }

  loadproject(user:UserModel):void{
    this.projectservice.getProjectsByUser(user.id).subscribe({
      next: (data) => {
        if (data.length == 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Pas de projets',
          });
        } else {
          this.list = data.filter((project) => project.archiverc);
          this.flist=data.filter((project) => project.archiverc);
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

  private fetchUser(email: string): void {
    this.usersService.getUserByEmail(email).subscribe(
        (data) => {
          this.user = data;
          this.loadproject(data);
          console.log(this.user)
        },
        (error) => {
          console.error('Error fetching user data', error);
          this.errorMessage = 'Error fetching user data. Please try again later.';
        }
    );
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
        this.projectservice.archiverc(id).subscribe({
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
