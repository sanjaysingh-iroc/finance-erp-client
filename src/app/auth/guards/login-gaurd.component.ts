import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Token } from '../login-model';
import { LocalStorageData } from '../../shared/local-storage-data';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private localStorageData: LocalStorageData
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.getTokenGuard();
  }

  getTokenGuard(): boolean {
    const token: Token = this.localStorageData.tokenValue;

    if (token == null) {
      this.authService.logout();
      return false;
    } else {
      let expireAt = new Date(token.expiredAt);
      let date: Date = new Date();

      if (expireAt.getTime() < date.getTime()) {
        this.authService.logout();
        return false;
      } else {
        date.setMinutes(date.getMinutes() + 60);
        token.expiredAt = date.toString();
        this.localStorageData.setToken(token);
      }
      return true;
    }
  }

}
