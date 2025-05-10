import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface SignInData {
  username: string;
  password: string;
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent {
  signInData: SignInData = {
    username: '',
    password: '',
  };
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    console.log(`${this.signInData.username} : ${this.signInData.password}`);

    this.authService.logIn(this.signInData).subscribe({
      next: (response) => {
        console.log('Full response:', response);

        // Customize this check depending on your backend error format
        if (response?.statusCode === 500 && response?.error === 'Bad credentials') {
          this.error = 'Invalid email or password. Please try again.';
          return;
        }

        const token = response?.access_token;
        if (!token) {
          this.error = 'Authentication failed: No token received.';
          return;
        }

        // Save tokens and session info in localStorage
        console.log('Saving token:', token);
        localStorage.setItem('token', token);


        // Extract user identifier (sub) from JWT token
        const tokenData = this.getUserIdentifierFromToken(token);
        console.log('usermail :', tokenData);
        localStorage.setItem('sessionId', tokenData.sessionId ?? '');

        localStorage.setItem('userMail', tokenData.username);

        // Optionally store IP address or other info
        const ipAddress = this.getIpAddress();
        localStorage.setItem('ipAddress', ipAddress);

        // Clear previous error and navigate to home or dashboard
        this.error = '';
        this.router.navigate(['/profile']).then((success) => {
          if (success) {
            console.log('Navigation to / successful');
          } else {
            console.warn('Navigation to / failed');
          }
        });
      },
      error: (err) => {
        this.error = 'Invalid username or password';
        console.error('Login error:', err);
      },
    });
  }

  private getUserIdentifierFromToken(token: string): any {
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log(' pylod:', payload);

      return payload ?? '';
    } catch (e) {
      console.error('Error decoding token', e);
      return '';
    }
  }

  private getIpAddress(): string {
    // Placeholder: replace with actual IP retrieval if needed
    return '127.0.0.1';
  }
}
