import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { first } from 'rxjs/operators';
import { LoginRequestModel } from '../login-model';
import { LocalStorageData } from '../../shared/local-storage-data';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { environment } from '@environments/environment';
import { UtilsService } from '../../shared/services/utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  returnUrl: string;
  hide = true;
  isUserValid: boolean;
  spinnerButtonOptions: MatProgressButtonOptions;
  userTitle: string = "Staff";
  apiURL: string = environment.apiUrl;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private utilsService: UtilsService,
    private localStorageData: LocalStorageData,
    private commonLayout: CommonLayout,
  ) {
  }

  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.progressLoginButton;
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
    this.isUserValid = true;
  }

  get f(): any {
    return this.loginForm.controls;
  }

  customerBtnClick() {

    this.userTitle = "Customer";

  }

  staffBtnClick() {

    this.userTitle = "Staff";

  }

  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.spinnerButtonOptions.active = true;
    const loginRequest: LoginRequestModel = this.loginForm.value;
    loginRequest.tokenType = 1;
    const date: Date = new Date();

    loginRequest.createdAt = this.date_TO_String(date);

    date.setMinutes(date.getMinutes() + 15);
    loginRequest.expiredAt = this.date_TO_String(date);

    if (this.userTitle == "Staff") {
      this.staffLogin(loginRequest);

    } else {
      this.customerLogin(loginRequest);
    }
  }

  staffLogin(loginRequest) {
    this.authService.login(loginRequest)
      .pipe(first())
      .subscribe(
        data => {
          this.localStorageData.setLoginData(data);
          const path: string[] = [];
          for (const sidebarItem of data.navigationDetails) {
            for (const submenuItem of sidebarItem.submenu) {
              path.push(submenuItem.path);
            }
          }
          this.localStorageData.setNavigationPath(path);

          this.utilsService.getAllSettings().subscribe(data => {
            this.localStorageData.setSettingData(data);

          });
          this.router.navigate(['pages/dashboard/staff-dashboard']);
        },
        error => {
          this.isUserValid = false;
          this.spinnerButtonOptions.active = false;
        });
  }

  customerLogin(loginRequest) {
    this.authService.customerLogin(loginRequest)
      .pipe(first())
      .subscribe(
        data => {
          this.localStorageData.setLoginData(data);
          this.localStorageData.setSelectedCustomer(data.customers[0].id);
          const path: string[] = [];
          for (const sidebarItem of data.navigationDetails) {
            for (const submenuItem of sidebarItem.submenu) {
              path.push(submenuItem.path);
            }
          }
          this.localStorageData.setNavigationPath(path);
          this.router.navigate(['pages/dashboard/customer-dashboard']);
        },
        error => {
          this.isUserValid = false;
          this.spinnerButtonOptions.active = false;
        });
  }

  date_TO_String(date: Date) {
    // 'MM/dd/yyyy h:mm:ss'
    // get the year, month, date, hours, and minutes seprately and append to the string.
    var date_String =

      (date.getMonth() + 1) +
      "/" +
      date.getDate() +
      "/" +
      date.getFullYear() +

      " " +
      +date.getHours() +
      ":" +
      +date.getMinutes() +
      ":" +
      +date.getSeconds();
    return date_String;
  }
}
