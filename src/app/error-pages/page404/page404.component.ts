import { Component, OnInit } from '@angular/core';
import { LoginModel } from '../../auth/login-model';
import { LocalStorageData } from '../../shared/local-storage-data';
@Component({
  selector: 'app-page404',
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.scss'],
})
export class Page404Component implements OnInit {
  login: LoginModel;
  homeLink: string;

  constructor(private localStorageData: LocalStorageData) { }
  ngOnInit() {

    this.login = this.localStorageData.userValue;

    if (!this.login) {
      this.login = this.localStorageData.customerValue;
      this.homeLink = '/pages/dashboard/customer-dashboard';

    } else {
      this.homeLink = '/pages/dashboard/staff-dashboard';
    }
  }
}