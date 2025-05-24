import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { UsersService } from 'src/app/core/services/user.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { IpService } from 'src/app/core/services/ip.service';

interface SignInData {
  username: string;
  password: string;
  ipAddress: string;
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  signInData: SignInData = { username: '', password: '', ipAddress: '' };
  error = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private usersService: UsersService,
    private userStateService: UserStateService,
    private ipService: IpService
  ) {}

  ngOnInit() {
    this.fetchIpAddress();
  }

  private fetchIpAddress(): void {
    this.ipService.getIpAddress().pipe(
      map(res => res.ip),
      catchError(() => of('127.0.0.1'))
    ).subscribe(ip => {
      this.signInData.ipAddress = ip;
      console.log('IP récupérée:', ip);
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.error = '';

    this.authService.logIn(this.signInData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.handleLoginSuccess(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.handleLoginError(err);
      }
    });
  }

  private handleLoginSuccess(response: any): void {
    if (response?.statusCode === 500 && response?.error === 'Bad credentials') {
      Swal.fire('Erreur', 'Identifiants invalides', 'error');
      return;
    }

    const accessToken = response?.access_token;
    const refreshToken = response?.refresh_token;
    const sessionId = response?.sessionId;

    if (!accessToken || !refreshToken || !sessionId) {
      Swal.fire('Erreur', 'Réponse invalide du serveur', 'error');
      return;
    }

    // Stocker les tokens et sessionId
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('sessionId', sessionId.toString());
    localStorage.setItem('ipAddress', this.signInData.ipAddress);

    // Charger le profil utilisateur
    this.usersService.getProfile().subscribe({
      next: (user) => {
        this.userStateService.setUser(user);
        Swal.fire({
          title: 'Connexion réussie!',
          text: 'Vous êtes maintenant connecté.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.userStateService.setUser(user);
          this.router.navigate(['/profile']);
        });
      },
      error: () => {
        this.userStateService.setUser(null);
        Swal.fire('Erreur', 'Impossible de charger le profil utilisateur.', 'error');
      }
    });
  }

  private handleLoginError(err: any): void {
    console.error('Erreur de connexion:', err);
    const errorMessage = err.error?.message || 'Erreur de connexion. Veuillez réessayer.';
    Swal.fire('Erreur', errorMessage, 'error');
  }
}
