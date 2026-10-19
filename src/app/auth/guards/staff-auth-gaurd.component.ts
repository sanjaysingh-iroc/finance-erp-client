import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageData } from '../../shared/local-storage-data';

@Injectable({
  providedIn: 'root'
})
export class StaffAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private localStorageData: LocalStorageData,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.getAccessGuard(state.url);
  }

  getAccessGuard(url: string): boolean {

    const login = this.localStorageData.userValue;

    if (login == null) {
      this.router.navigate(['finance/error/page401']);
      return false;
    }
    return true;
  }

}
