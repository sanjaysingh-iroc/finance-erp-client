import { Component, OnInit } from '@angular/core';
import { LocalStorageData } from '../../shared/local-storage-data';
import { SessionModel } from '../../session/session.model';
import { environment } from '@environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';
import { Router } from '@angular/router';

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

  constructor(
    private staffService: StaffService,
    private localStorageData: LocalStorageData,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.session = this.localStorageData.sessionValue;


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
    this.router.navigateByUrl('pages/staff/about-staff', { state: { staff: staff, action: 'view' } });
  }


  onSubmit() {
    this.staffService.getUsersByName(this.session.id, this.classForm.get("search").value).subscribe(
      data => {
        this.staffs = data;
      });
  }

}

