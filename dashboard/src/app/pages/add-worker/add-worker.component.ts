import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkersService } from '../../core/services/workers.service';
import { NotificationService } from '../../core/services/notification.service';
import { UsersService } from '../../core/services/users.service';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-worker',
  templateUrl: './add-worker.component.html',
  styleUrls: ['./add-worker.component.scss']
})
export class AddWorkerComponent implements OnInit {
  addWorkerForm: FormGroup;
  errorMessage = '';
  userMail = localStorage.getItem('userMail');
  user: any;
  formSubmitted: boolean = false; // Drapeau pour suivre l'envoi du formulaire
  isSubmitting: boolean = false; // Drapeau pour suivre si le formulaire est en cours d'envoi

  roles: string[] = [
    'ADMIN',
    'SUBADMIN',
    'Processus Management Qualité',
    'Processus Conception ET Développement',
    'Processus Méthode',
    'Processus Production',
    'Processus Logistique ET Commerciale',
    'Processus DAF'
  ];

  constructor(
      private fb: FormBuilder,
      private workersService: WorkersService,
      private notificationsService: NotificationService,
      private usersService: UsersService,
      private router: Router
  ) {
    this.addWorkerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchUser(this.userMail);
  }

  addWorker(): void {
    this.formSubmitted = true; // Définir le drapeau sur vrai lors de l'envoi du formulaire
    this.isSubmitting = true; // Définir le drapeau d'envoi sur vrai

    if (this.addWorkerForm.valid) {
      const newWorker = this.addWorkerForm.value;

      this.workersService.getWorkerByEmail(newWorker.email).subscribe(
          (exists) => {
            if (exists) {
              this.isSubmitting = false; // Réinitialiser le drapeau d'envoi
              Swal.fire({
                icon: 'warning',
                title: 'Email déjà utilisé',
                text: 'Cet email est déjà utilisé. Veuillez utiliser un email différent.',
                confirmButtonText: 'OK'
              });
            } else {
              this.workersService.createWorker(newWorker).subscribe(
                  () => {
                    this.showSuccessMessage('Employé ajouté avec succès.');
                    this.resetForm();
                    this.errorMessage = '';
                  },
                  (error) => {
                    console.error('Erreur lors de l\'ajout de l\'employé', error);
                    this.showErrorMessage('Erreur lors de l\'ajout de l\'employé. Veuillez réessayer plus tard.');
                    this.isSubmitting = false; // Réinitialiser le drapeau d'envoi
                  }
              );
            }
          },
          (error) => {
            console.error('Erreur lors de la vérification de l\'existence de l\'email', error);
            this.showErrorMessage('Erreur lors de la vérification de l\'email. Veuillez réessayer plus tard.');
            this.isSubmitting = false; // Réinitialiser le drapeau d'envoi
          }
      );
    } else {
      this.isSubmitting = false; // Réinitialiser le drapeau d'envoi si le formulaire est invalide
    }
  }

  private showSuccessMessage(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: message,
      confirmButtonText: 'OK'
    });
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message,
      confirmButtonText: 'OK'
    });
  }

  private fetchUser(email: string): void {
    this.usersService.getUserByEmail(email).subscribe(
        (data) => {
          this.user = data;
        },
        (error) => {
          console.error('Erreur lors de la récupération des données utilisateur', error);
          this.errorMessage = 'Erreur lors de la récupération des données utilisateur. Veuillez réessayer plus tard.';
        }
    );
  }

  private resetForm(): void {
    this.addWorkerForm.reset();
    this.formSubmitted = false; // Réinitialiser le drapeau d'envoi
    this.isSubmitting = false; // Réinitialiser le drapeau d'envoi
  }

  goBack() {
    this.router.navigate(['/list-worker']);
  }
}