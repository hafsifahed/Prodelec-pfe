import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/core/services/user.service';
import { Role } from 'src/app/core/models/role.model';
import { Partner } from 'src/app/core/models/partner.models';
import Swal from 'sweetalert2';
import { AccountStatus, User } from 'src/app/core/models/auth.models';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error = '';
  title = 'Utilisateur';

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Utilisateur', active: true }
  ];

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = +this.route.snapshot.paramMap.get('id');
    console.log("us is:",userId)
    if (!userId) {
      this.error = 'ID utilisateur invalide';
      this.loading = false;
      return;
    }
    this.usersService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        console.log(user)
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger l\'utilisateur';
        this.loading = false;
        Swal.fire('Erreur', this.error, 'error');
      }
    });
  }

  goBack() {
  if (this.user && this.user.role && !this.user.role.name.toUpperCase().startsWith('CLIENT')) {
    // Si le rôle ne commence pas par "CLIENT", redirige vers list-worker
    this.router.navigate(['/list-worker']);
  } else {
    // Sinon, redirige vers list-user
    this.router.navigate(['/list-user']);
  }
}


  getAccountStatusLabel(status: string): string {
    switch (status) {
      case AccountStatus.ACTIVE: return 'Actif';
      case AccountStatus.INACTIVE: return 'Inactif';
      case AccountStatus.SUSPENDED: return 'Suspendu';
      default: return status;
    }
  }
}
