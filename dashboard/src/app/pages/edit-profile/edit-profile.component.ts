import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { UsersService } from 'src/app/core/services/user.service';
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
  isSubmitting = false;  // <-- Ajoutez cette ligne
  selectedFile?: File;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
      private fb: FormBuilder,
      private usersService: UsersService,
      private router: Router
  ) {
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: true }, Validators.required],
      password: [''], // facultatif, gérez la validation selon besoin
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: [{ value: '', disabled: true }],
      image: [''] // champ image optionnel
    });
  }

  ngOnInit(): void {



      this.fetchUserProfile();

  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  private fetchUserProfile(): void {
    this.usersService.getProfile().subscribe(
        (data) => {
          this.user = data;
          this.profileForm.patchValue(this.user);
          if (this.user.image) {
            this.previewUrl = this.usersService.getUserImageUrl(this.user);
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des données de l\'utilisateur', error);
          this.errorMessage = 'Erreur lors de la récupération des données de l\'utilisateur. Veuillez réessayer plus tard.';
        }
    );
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const updatedProfile = this.profileForm.getRawValue();

    this.isSubmitting = true;

    if (this.selectedFile) {
      // Upload image avant mise à jour
      this.usersService.uploadImage(this.selectedFile).subscribe({
        next: (event) => {
          if (event.body) {
            updatedProfile.image = event.body.filename;
            this.updateProfile(updatedProfile);
          }
        },
        error: () => {
          Swal.fire('Erreur', 'Erreur lors de l\'upload de l\'image', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.updateProfile(updatedProfile);
    }
  }

  private updateProfile(profile: any): void {
      this.usersService.updateUserFull(this.user.id, profile).subscribe({
            next: () => {
              Swal.fire('Succès', 'Utilisateur mis à jour avec succès', 'success');
              this.router.navigate(['/list-user']);
            },
            error: () => {
              Swal.fire('Erreur', 'Échec de la mise à jour', 'error');
              this.isSubmitting = false;
            }
          });
    
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
