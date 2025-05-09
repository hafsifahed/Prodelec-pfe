import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkerSessionService } from '../../core/services/worker-session.service';
import { UserSessionService } from '../../core/services/user-session.service';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
    signInData = {
        emailOrUserName: '',
        password: ''
    };
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private workerSessionService: WorkerSessionService,
        private userSessionService: UserSessionService
    ) { }

    onSubmit() {
        console.log(this.signInData.emailOrUserName + ' : ' + this.signInData.password);
        this.authService.signIn(this.signInData).subscribe(
            (response) => {
                console.log('Sign in response', response);

                if (response.statusCode === 500 && response.error === 'Bad credentials') {
                    this.errorMessage = 'Invalid email or password. Please try again.';
                } else {
                    // Store tokens, userType, and other details in local storage
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('refreshToken', response.refreshToken);
                    localStorage.setItem('expirationTime', response.expirationTime);
                    localStorage.setItem('userType', response.userType); // Save userType in localStorage

                    // Extract user identifier from token
                    const userMail = this.getUserIdentifierFromToken(response.token);
                    localStorage.setItem('userMail', userMail);

                    const userType = response.userType;
                    const ipAddress = this.getIpAddress(); // Replace with actual method to get IP address

                    // Determine user type and start the appropriate session
                    if (userType === 'worker') {
                        this.workerSessionService.startSession(userMail, ipAddress).subscribe(
                            (sessionResponse) => {
                                console.log('Worker session started', sessionResponse);
                                localStorage.setItem('sessionId', sessionResponse.id); // Save session ID in localStorage
                                this.router.navigate(['/dashboard']);
                            },
                            (error) => {
                                console.error('Failed to start worker session', error);
                                this.errorMessage = 'Failed to start session. Please try again.';
                            }
                        );
                    } else {
                        this.userSessionService.startSession(userMail, ipAddress).subscribe(
                            (sessionResponse) => {
                                console.log('User session started', sessionResponse);
                                localStorage.setItem('sessionId', sessionResponse.id); // Save session ID in localStorage
                                this.router.navigate(['/dashboard']);
                            },
                            (error) => {
                                console.error('Failed to start user session', error);
                                this.errorMessage = 'Failed to start session. Please try again.';
                            }
                        );
                    }
                }
            },
            (error) => {
                console.error('Sign in failed', error);
                this.errorMessage = 'Sign in failed. Please try again.';
            }
        );
    }

    private getUserIdentifierFromToken(token: string): string {
        // Decode JWT token to extract user identifier (sub field)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
    }

    private getIpAddress(): string {
        // Replace this with actual logic to retrieve the client's IP address
        return '127.0.0.1';
    }
}