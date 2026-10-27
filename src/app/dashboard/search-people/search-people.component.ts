import { Component, OnInit } from '@angular/core';
import { LocalStorageData } from '../../shared/local-storage-data';
import { SessionModel } from '../../session/session.model';
import { environment } from '@environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { Router } from '@angular/router';
import { StaffModel } from '../../staff/staff.model';
import { StaffService } from '../../staff/staff.service';
import { LoginModel } from '../../auth/login-model';

@Component({
  selector: 'app-search-people',
  templateUrl: './search-people.component.html',
  styleUrls: ['./search-people.component.scss'],
})
export class SearchPeopleComponent implements OnInit {

  classMap: Map<number, string> = new Map<number, string>();
  sectionMap: Map<number, string> = new Map<number, string>();
  session: SessionModel;
  apiURL: string = environment.apiUrl;

  staffs: StaffModel[] = [];

  classForm: FormGroup;
  login: LoginModel;
  constructor(
    private staffService: StaffService,
    private localStorageData: LocalStorageData,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.session = this.localStorageData.sessionValue;
    this.login = this.localStorageData.userValue;

    let search: string = '';
    if (history.state.search) {
      search = history.state.search;
    }
    this.classForm = this.fb.group({
      search: [search, [Validators.required]]
    });

    if (history.state.search) {
      this.onSubmit();
    }
  }

  viewStaffProfile(staff) {
    this.router.navigateByUrl('finance/staff/about-staff', { state: { staff: staff, action: 'view' } });
  }


  onSubmit() {
    this.staffService.getUsersByName(this.login.companyId, this.classForm.get("search").value).subscribe(
      data => {
        this.staffs = data;
      });
  }

}

