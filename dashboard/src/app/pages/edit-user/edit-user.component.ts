import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../core/services/users.service';
import { UserModel } from '../../core/models/user.models';
import Swal from 'sweetalert2';
import { UserEditDto } from "../../core/models/user-edit-dto";

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  user: UserEditDto = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    userSessions: [],
  };
  errorMessage = '';
  roles: string[] = ['CLIENTADMIN', 'CLIENTUSER'];

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.usersService.getUserById(id).subscribe(
        (user) => {
          const processedUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            role: user.role,
            userSessions: user.userSessions
          };
          this.user = processedUser;
        },
        (error: any) => {
          console.error('Erreur lors de la récupération de l\'utilisateur', error);
          this.showErrorMessage('Erreur lors de la récupération de l\'utilisateur. Veuillez réessayer plus tard.');
        }
    );
  }

  updateUser(): void {
    this.usersService.updateUser(this.user.id, this.user).subscribe(
        () => {
          Swal.fire({
            title: 'Succès!',
            text: 'Utilisateur mis à jour avec succès.',
            icon: 'success'
          });
          this.router.navigate(['/list-user']);
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
          Swal.fire({
            title: 'Erreur!',
            text: 'Une erreur s\'est produite lors de la mise à jour de l\'utilisateur.',
            icon: 'error'
          });
        }
    );
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  goBack() {
    this.router.navigate(['/list-user']);
  }
}