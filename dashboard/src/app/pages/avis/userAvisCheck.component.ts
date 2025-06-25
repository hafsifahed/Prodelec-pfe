import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/core/models/auth.models';
import { AvisService } from 'src/app/core/services/avis.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-user-avis-check',
  template: `
    <div *ngIf="showAvisSection" class="alert alert-success mt-3 d-flex justify-content-between align-items-center">
      <p class="mb-0">Ajouter un nouvel avis (même avis)</p>
      <button class="btn btn-primary" routerLink="/avis">Ajouter un nouvel avis</button>
    </div>
  `
})
export class UserAvisCheckComponent implements OnInit {
  hasOldAvis: boolean | null = null;
  user: User | null = null;
  showAvisSection: boolean = false;

  constructor(
    private avisService: AvisService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit(): void {
    this.userStateService.user$.subscribe(user => {
      this.user = user;

      // Vérifier que le rôle commence par "CLIENT"
      if (user && user.role && user.role.name.toUpperCase().startsWith('CLIENT')) {
        this.hasOldAvisCheck(user.id);
      } else {
        this.showAvisSection = false; // Ne pas afficher si pas client
      }
    });
  }

  hasOldAvisCheck(userId: number): void {
    this.avisService.hasOldAvis(userId).subscribe({
      next: (result) => {
        this.hasOldAvis = result;
        this.showAvisSection = result; // Affiche la section uniquement si hasOldAvis = true
      },
      error: (error) => {
        console.error('Erreur lors de la vérification des avis', error);
        this.showAvisSection = false;
      }
    });
  }
}
