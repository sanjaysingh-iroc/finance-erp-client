import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AnnouncementService } from '../../announcement/announcement.service';
import { settings } from '../../../demo/data';
import { AnnouncementModel } from '../announcement.model';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';

@Component({
  selector: 'app-add-announcement',
  templateUrl: './add-announcement.component.html',
  styleUrls: ['./add-announcement.component.css']
})
export class AddAnnouncementComponent implements OnInit {
  action: string;
  dialogTitle: string = 'Add';
  announcementModel: AnnouncementModel;
  announcementForm: FormGroup;
  minDate: Date;
  spinnerButtonOptions: MatProgressButtonOptions;
  login: LoginModel;
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();

  constructor(private fb: FormBuilder,
    private announcementService: AnnouncementService,
    private staffService: StaffService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.minDate = new Date();
    this.action = history.state.action;

    this.staffService.getAllUsers(this.login.companyId).subscribe(data => {
      data.forEach(staffModel => this.staffMap.set(staffModel.id, staffModel));
    });

    if (this.action === 'edit') {
      this.announcementModel = history.state.announcementModel;
      this.dialogTitle = 'Edit'
    } else {
      this.announcementModel = new AnnouncementModel({});
      this.announcementModel.createDate = formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en');
    }

    this.announcementForm = this.fb.group({
      staffId: [this.announcementModel.staffId, [Validators.required]],
      message: [this.announcementModel.message, [Validators.required]],
      createDate: [this.announcementModel.createDate, [Validators.required]],
    });
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;
    const announcementModel: AnnouncementModel = new AnnouncementModel(this.announcementForm.value);
    announcementModel.companyId = this.login.companyId;

    if (this.action === 'edit') {
      announcementModel.id = this.announcementModel.id;
    }

    this.announcementService.addNewAnnouncement(announcementModel).pipe(first()).subscribe(data => {
      this.router.navigate(['billing/finance/announcement/all-announcement']);
    });
  }



  getSMSText(smsTemplate: string, params: string[]) {
    let index = 1;
    params.forEach(param => {
      smsTemplate = smsTemplate.replace("{{" + index + "}}", param);
    })
    return smsTemplate;
  }

}
