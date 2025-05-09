import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { PartnersService } from '../../core/services/partners.service';
import { Partner } from '../../core/models/partner.models';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  addUserForm: FormGroup;
  errorMessage = '';
  partners: Partner[] = [];
  userMail = localStorage.getItem('userMail');
  roles: string[] = ['CLIENTADMIN', 'CLIENTUSER']; // Liste des rôles disponibles
  user: any;
  formSubmitted = false; // Drapeau pour suivre l'envoi du formulaire
  isSubmitting = false; // Drapeau pour suivre si le formulaire est en cours d'envoi

  constructor(
      private fb: FormBuilder,
      private usersService: UsersService,
      private partnersService: PartnersService,
      private notificationService: NotificationService,
      private router: Router
  ) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      partnerId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPartners();
    this.fetchUser(this.userMail);
  }

  loadPartners(): void {
    this.partnersService.getAllPartners().subscribe(
        (partners: Partner[]) => {
          this.partners = partners;
        },
        (error) => {
          console.error('Erreur lors du chargement des partenaires', error);
        }
    );
  }

  addUser(): void {
    this.formSubmitted = true; // Définir le drapeau sur vrai lors de l'envoi du formulaire
    this.isSubmitting = true; // Définir le drapeau d'envoi sur vrai

    if (this.addUserForm.valid) {
      const newUser = this.addUserForm.value;
      const partnerId = newUser.partnerId;

      this.usersService.getUserByEmail(newUser.email).subscribe(
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
              this.usersService.createUser(newUser, partnerId).subscribe(
                  () => {
                    this.showSuccessMessage('Utilisateur ajouté avec succès.');
                    this.resetForm();
                    this.errorMessage = '';
                  },
                  (error) => {
                    console.error('Erreur lors de l\'ajout de l\'utilisateur', error);
                    this.showErrorMessage('Erreur lors de l\'ajout de l\'utilisateur. Veuillez réessayer plus tard.');
                    this.isSubmitting = false; // Réinitialiser le drapeau d'envoi
                  }
              );
            }
          },
          (error) => {
            console.error('Erreur lors de la vérification de l\'existence de l\'email', error);
            this.showErrorMessage('Cet email est déjà utilisé. Veuillez utiliser un email différent.');
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
    Swal.fire({
      icon: 'warning',
      title: 'Email déjà utilisé',
      text: message,
      confirmButtonText: 'OK'
    });
  }

  private fetchUser(email: string): void {
    if (email) {
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
  }

  private resetForm(): void {
    this.addUserForm.reset();
    this.formSubmitted = false; // Réinitialiser le drapeau d'envoi
    this.isSubmitting = false; // Réinitialiser le drapeau d'envoi
  }

  goBack(): void {
    this.router.navigate(['/list-user']);
  }
}