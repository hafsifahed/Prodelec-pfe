import { Injectable } from '@angular/core';

import { getFirebaseBackend } from '../../authUtils';

import { User } from '../models/auth.models';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({ providedIn: 'root' })

export class AuthService {

    private apiUrl = `${environment.baseUrl}/auth`; // Update with your actual backend URL

    constructor(private http: HttpClient) {}

    logIn(signInData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, signInData);
    }
}

