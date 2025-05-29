import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // Optionnel : déconnecter l'utilisateur proprement
          // this.authService.logOut(); // ou votre méthode de logout
          // Ne pas faire location.reload() ici pour ne pas bloquer la gestion d'erreur dans le composant
        }

        // Renvoyer l'erreur complète pour que le composant puisse la traiter
        return throwError(() => err);
      })
    );
  }
}
