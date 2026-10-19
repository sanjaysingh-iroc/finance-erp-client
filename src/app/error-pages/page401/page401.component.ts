import { Component, OnInit } from '@angular/core';
import { LoginModel } from '../../auth/login-model';
import { LocalStorageData } from '../../shared/local-storage-data';
@Component({
  selector: 'app-page401',
  templateUrl: './page401.component.html',
  styleUrls: ['./page401.component.scss'],
})
export class Page401Component implements OnInit {

  login: LoginModel;
  homeLink: string;

  constructor(private localStorageData: LocalStorageData) { }
  ngOnInit() {

    this.login = this.localStorageData.userValue;

    if (!this.login) {
      this.login = this.localStorageData.customerValue;
      this.homeLink = '/finance/dashboard/customer-dashboard';

    } else {
      this.homeLink = '/finance/dashboard/staff-dashboard';
    }
  }
}
