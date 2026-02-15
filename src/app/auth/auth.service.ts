import { Injectable } from '@angular/core';
import { LoginRequestModel, LoginResponseModel } from './login-model';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { LocalStorageData } from '../shared/local-storage-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    private http: HttpClient,
    private localStorageData: LocalStorageData,
    private handler: HttpBackend
  ) {
    this.http = new HttpClient(this.handler);

  }

  login(loginRequest: LoginRequestModel): Observable<LoginResponseModel> {
    return this.http.post<LoginResponseModel>(`${environment.apiUrl}/auth/validateLogin`, loginRequest)
      .pipe(map(user => {
        window.localStorage.setItem('logged_in', 'true');
        return user;
      }));
  }

  customerLogin(loginRequest: LoginRequestModel): Observable<LoginResponseModel> {
    return this.http.post<LoginResponseModel>(`${environment.apiUrl}/auth/validateCustomerLogin`, loginRequest)
      .pipe(map(user => {
        window.localStorage.setItem('logged_in', 'true');
        return user;
      }));
  }

  logout(): void {
    // remove user from local storage and set current user to null
    localStorage.removeItem("user");
    localStorage.removeItem("navigationsPath");
    localStorage.removeItem("selectedCustomer");
    localStorage.removeItem("settings");

    this.localStorageData.settingSubject.next(null);
    this.localStorageData.userSubject.next(null);
    this.localStorageData.navigationPathSubject.next(null);

    window.localStorage.setItem('logged_in', 'false');
    this.router.navigate(['/auth/login']);
  }
}
