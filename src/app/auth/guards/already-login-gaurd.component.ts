import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageData } from '../../shared/local-storage-data';

@Injectable({
  providedIn: 'root'
})
export class AlreadyLoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private localStorageData: LocalStorageData,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.getAccessGuard(state.url);
  }

  getAccessGuard(url: string): boolean {

    if (this.localStorageData.sessionValue) {
      this.router.navigate(['finance/dashboard/staff-dashboard']);
      return false;
    }
    return true;

  }

}
