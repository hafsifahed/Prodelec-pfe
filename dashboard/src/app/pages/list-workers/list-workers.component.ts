import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from "@angular/router";
import { User } from 'src/app/core/models/auth.models'; // Assure-toi que c'est le bon chemin pour ton modèle User
import { UsersService } from 'src/app/core/services/user.service'; // Utilise UsersService

@Component({
  selector: 'app-list-workers',
  templateUrl: './list-workers.component.html',
  styleUrls: ['./list-workers.component.scss','../list-users/list-users.component.scss']
})
export class ListWorkersComponent implements OnInit {
  workers: User[] = [];
  errorMessage = '';
  searchKeyword: string = '';
  loggedInUserRole: string | undefined; // Pour stocker le rôle de l'utilisateur connecté afin de gérer les permissions d'affichage des boutons.

  p: number = 1; // Current page number
  itemsPerPage: number = 5; // Number of items per page

  title = 'Employés'; // Ajouté pour le breadcrumb si tu en utilises un

  breadcrumbItems = [ // Ajouté pour le breadcrumb si tu en utilises un
    { label: 'Accueil', active: false },
    { label: 'Employés', active: true }
  ];


  constructor(
    private usersService: UsersService, // Utilise UsersService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchWorkers();
    // Tu devras probablement charger le rôle de l'utilisateur connecté ici pour les permissions
    // Exemple (si tu as une méthode pour récupérer le profil utilisateur) :
    this.usersService.getProfile().subscribe(
      (userProfile) => {
        this.loggedInUserRole = userProfile.role.name as string; // Assure-toi que userProfile.role.name est une string
      },
      (error) => {
        console.error('Erreur lors du chargement du profil utilisateur', error);
      }
    );
  }

  fetchWorkers(): void {
    // Appel correct à UsersService pour obtenir les workers
    this.usersService.getWorkers().subscribe( // Assure-toi que cette méthode existe et retourne des User[]
      (workers) => {
        this.workers = workers;
        this.errorMessage = ''; // Réinitialise l'erreur en cas de succès
      },
      (error) => {
        console.error('Error fetching workers', error);
        this.showErrorMessage('Error fetching workers. Please try again later.');
      }
    );
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
  }

  // Utilise User, pas WorkerModel si tu n'as plus WorkerModel
  editWorker(worker: User): void {
    this.router.navigate(['/edit-user', worker.id]); // Redirige vers la page d'édition d'utilisateur
  }

  // Utilise User
  deleteWorker(worker: User): void {
    Swal.fire({
      title: 'Confirmation',
      text: `Are you sure you want to delete ${worker.firstName} ${worker.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.usersService.deleteUser(worker.id).subscribe(
          () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The worker has been deleted successfully.',
              icon: 'success'
            });
            this.fetchWorkers(); // Refresh list after deletion
          },
          (error) => {
            console.error('Error deleting worker', error);
            Swal.fire({
              title: 'Error!',
              text: 'An error occurred while deleting the worker.',
              icon: 'error'
            });
          }
        );
      }
    });
  }

  // Utilise User
  editWorkerPassword(worker: User): void {
    Swal.fire({
      title: 'Enter New Password',
      input: 'password',
      inputPlaceholder: 'Enter new password',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: (newPassword: string) => { // Spécifie le type de newPassword
        if (!newPassword || newPassword.length < 8) {
          Swal.showValidationMessage('Password must be at least 8 characters');
          return;
        }
        // Appelle le service pour mettre à jour le mot de passe du worker
        return this.usersService.setPassword(worker.id, { newPassword }).toPromise() // Assure-toi que setPassword attend un objet { newPassword }
          .catch(error => {
            Swal.showValidationMessage(`Request failed: ${error.message}`);
          });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Password Updated!',
          text: 'The password has been updated successfully.',
          icon: 'success'
        });
      }
    });
  }

  navigateToAddWorker(): void {
    this.router.navigate(['/add-user']); // Redirige vers la page d'ajout d'utilisateur
  }

  searchWorkers(): void {
    const keyword = this.searchKeyword.trim();
    if (keyword === '') {
      this.fetchWorkers(); // Recharge tous les workers si la recherche est vide
    } else if (keyword.length >= 2) { // Tu peux affiner cette condition si besoin
      // Si tu as une méthode de recherche spécifique pour les workers ou tu filtres localement
      // Dans l'exemple du ListUsersComponent, il y a une méthode searchUsers qui est un appel API.
      // Ici, nous allons filtrer localement pour l'instant, mais une recherche API serait meilleure pour de grandes listes.
      this.workers = this.workers.filter(worker =>
          worker.firstName.toLowerCase().includes(keyword.toLowerCase()) ||
          worker.lastName.toLowerCase().includes(keyword.toLowerCase()) ||
          worker.email.toLowerCase().includes(keyword.toLowerCase()) ||
          // Correction pour le rôle: accéder à .name de l'objet rôle
          (worker.role && worker.role.name.toLowerCase().includes(keyword.toLowerCase()))
      );
    } else {
      this.showErrorMessage('Veuillez entrer au moins 2 caractères pour la recherche.');
    }
  }


  onSearchInputChange(): void {
    this.searchWorkers();
  }
  clearSearch(): void {
    this.searchKeyword = '';
    this.fetchWorkers();
  }

  // Ces méthodes ne sont plus utilisées si tu gères tout via UsersService
  // private fetchUserProfile(email: string): void { /* ... */ }
  // private fetchWorkerProfile(email: string): void { /* ... */ }

  // Tu peux ajouter une méthode pour le statut si tu veux
  toggleWorkerStatus(worker: User): void {
    // Implémentation similaire à ListUsersComponent
    const newStatus = worker.accountStatus === 'active' ? 'inactive' : 'active'; // ou 'suspended'
    this.usersService.updateAccountStatus(worker.id, { status: newStatus as any }).subscribe({
      next: (updatedWorker) => {
        worker.accountStatus = updatedWorker.accountStatus;
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: `Le statut de ${worker.firstName} ${worker.lastName} est maintenant ${updatedWorker.accountStatus}.`,
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de mettre à jour le statut. Veuillez réessayer.',
        });
      }
    });
  }
}
