import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { WorkersService } from '../../core/services/workers.service';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: any;
  userType: string | null = '';
  errorMessage = '';

  constructor(
      private fb: FormBuilder,
      private usersService: UsersService,
      private workersService: WorkersService,
      private router: Router
  ) {
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: false }, Validators.required],
      password: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: [{ value: '', disabled: false }, Validators.required]
    });
  }

  ngOnInit(): void {
    this.userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userMail');

    if (!this.userType || !userEmail) {
      this.errorMessage = 'Informations utilisateur non trouvées dans le stockage local.';
      return;
    }

    if (this.userType === 'user') {
      this.fetchUserProfile(userEmail);
    } else if (this.userType === 'worker') {
      this.fetchWorkerProfile(userEmail);
    } else {
      this.errorMessage = 'Type d\'utilisateur invalide.';
    }
  }

  private fetchUserProfile(email: string): void {
    this.usersService.getUserByEmail(email).subscribe(
        (data) => {
          this.user = data;
          this.profileForm.patchValue(this.user);
        },
        (error) => {
          console.error('Erreur lors de la récupération des données de l\'utilisateur', error);
          this.errorMessage = 'Erreur lors de la récupération des données de l\'utilisateur. Veuillez réessayer plus tard.';
        }
    );
  }

  private fetchWorkerProfile(email: string): void {
    this.workersService.getWorkerByEmail(email).subscribe(
        (data) => {
          this.user = data;
          this.profileForm.patchValue(this.user);
        },
        (error) => {
          console.error('Erreur lors de la récupération des données du travailleur', error);
          this.errorMessage = 'Erreur lors de la récupération des données du travailleur. Veuillez réessayer plus tard.';
        }
    );
  }

  onSave(): void {
    if (this.profileForm.valid) {
      const updatedProfile = this.profileForm.value;

      if (this.userType === 'user') {
        this.updateUserProfile(updatedProfile);
      } else if (this.userType === 'worker') {
        this.updateWorkerProfile(updatedProfile);
      }
    }
  }

  private updateUserProfile(profile: any): void {
    this.usersService.updateUser(this.user.id, profile).subscribe(
        () => {
          this.showSuccessMessage('Profil mis à jour avec succès.');
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du profil utilisateur', error);
          this.showErrorMessage('Erreur lors de la mise à jour du profil utilisateur. Veuillez réessayer plus tard.');
        }
    );
  }

  private updateWorkerProfile(profile: any): void {
    this.workersService.updateWorker(this.user.id, profile).subscribe(
        () => {
          this.showSuccessMessage('Profil mis à jour avec succès.');
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du profil du travailleur', error);
          this.showErrorMessage('Erreur lors de la mise à jour du profil du travailleur. Veuillez réessayer plus tard.');
        }
    );
  }

  private showSuccessMessage(message: string): void {
    Swal.fire({
      title: 'Succès!',
      text: message,
      icon: 'success'
    });
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    Swal.fire({
      title: 'Erreur!',
      text: message,
      icon: 'error'
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}