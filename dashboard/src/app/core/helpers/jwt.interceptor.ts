import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Check if the request URL is for the sign-in endpoint
        if (request.url.includes('/auth/signin')) {
            return next.handle(request); // Skip token interception for sign-in requests
        }

        // Get the JWT token from local storage
        const token = localStorage.getItem('token');

        // Add the token to the Authorization header
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        // Pass the modified request to the next interceptor or the HTTP handler
        return next.handle(request);
    }
}