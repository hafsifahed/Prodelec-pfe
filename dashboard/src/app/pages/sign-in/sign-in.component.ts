import { Component, OnInit } from '@angular/core'; // Ajouter OnInit
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { UsersService } from 'src/app/core/services/user.service';
import { catchError, map } from 'rxjs/operators'; // Ajouter ces imports
import { of } from 'rxjs';
import { IpService } from 'src/app/core/services/ip.service';

interface SignInData {
  username: string;
  password: string;
  ipAddress:string;
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit { // Implémenter OnInit
  signInData: SignInData = { username: '', password: '',ipAddress:'' };
  error = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private usersService: UsersService,
    private userStateService: UserStateService,
    private ipService: IpService
  ) {}

  // Nouvelle méthode ngOnInit
  ngOnInit() {
    this.fetchIpAddress();
  }

  private fetchIpAddress(): void {
    this.ipService.getIpAddress().pipe(
      map(res => res.ip),
      catchError(() => of('127.0.0.1'))
    ).subscribe(ip => {
      this.signInData.ipAddress = ip;
      console.log(this.signInData.ipAddress+" = "+ip)
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

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

    const token = response?.access_token;
    if (!token) {
      Swal.fire('Erreur', 'Échec de l\'authentification : aucun token reçu', 'error');
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('ipAddress', this.signInData.ipAddress); // Utiliser la propriété stockée

    const tokenData = this.getUserIdentifierFromToken(token);
    localStorage.setItem('sessionId', tokenData.sessionId ?? '');
    localStorage.setItem('userMail', tokenData.username);

    Swal.fire({
      title: 'Connexion réussie!',
      text: 'Vous êtes maintenant connecté.',
      icon: 'success',
      confirmButtonText: 'OK'
    }).then(() => {
      if (token) {
        this.usersService.getProfile().subscribe({
          next: (user) => this.userStateService.setUser(user),
          error: () => this.userStateService.setUser(null),
        });
      }
      this.router.navigate(['/profile']);
    });
  }

  // Supprimer l'ancienne méthode getIpAddress() devenue inutile
  private getUserIdentifierFromToken(token: string): any {
    if (!token) return '';
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decoding token', e);
      return '';
    }
  }

  private handleLoginError(err: any): void {
    console.error('Login error:', err);
    const errorMessage = err.error?.message || 'Erreur de connexion. Veuillez réessayer.';
    Swal.fire('Erreur', errorMessage, 'error');
  }
}
