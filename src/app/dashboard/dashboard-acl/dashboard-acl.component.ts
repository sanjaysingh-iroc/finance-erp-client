import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationsService } from '../../shared/notifications-service';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { DashboardService } from './../dashboard.service';
import { DashboardModel, UpdateDashboardAclModel } from '../dashboard.model';
import { SessionService } from '../../session/session.service';
import { first } from 'rxjs/operators';
import { UserTypeModel } from '../../shared/common.models';
import { UtilsService } from '../../shared/services/utils.service';

@Component({
  selector: 'app-dashboard-acl',
  templateUrl: './dashboard-acl.component.html',
  styleUrls: ['./dashboard-acl.component.sass']
})
export class DashboardAclComponent implements OnInit {

  stdForm: FormGroup;
  public sidebarItems: DashboardModel[];
  public userTypeList: UserTypeModel[] = [];
  selectmap: Map<number, boolean> = new Map<number, boolean>();
  spinnerButtonOptions: MatProgressButtonOptions;

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private notification: NotificationsService,
    private utilsService: UtilsService,
    private commonLayout: CommonLayout,
  ) { }

  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.stdForm = this.fb.group({
      userType: ['', [Validators.required]],
    });

    this.utilsService.getAllUserType().subscribe(data => {
      data.forEach(element => {
        if (element.id != 1) {
          this.userTypeList.push(element);
        }
      });

    });
    this.dashboardService.getAllDashboardDetails().subscribe(data => {
      this.sidebarItems = data;
    });

  }

  getAllDashboardAclDetails() {
    this.dashboardService.getAllDashboardAclDetails(this.stdForm.get('userType').value).subscribe(data => {
      this.selectmap.clear();
      data.forEach(element => this.selectmap.set(element.dashboardId, true));
    });
  }

  toggle(event, dashboardId) {
    this.selectmap.set(dashboardId, event.checked);
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;

    const userType = this.stdForm.get('userType').value;
    let updateDashboardAclModel: UpdateDashboardAclModel = new UpdateDashboardAclModel();
    let dashboardIds: number[] = [];
    for (let isSelect of this.selectmap.entries()) {
      if (isSelect[1]) {
        dashboardIds.push(isSelect[0]);
      }
    }
    updateDashboardAclModel.userTypeId = userType;
    updateDashboardAclModel.dashboardIds = dashboardIds;
    this.dashboardService.updateDashboardAclDetails(updateDashboardAclModel).pipe(first()).subscribe(data => {
      this.spinnerButtonOptions.active = false;
      this.notification.showSuccessNotification(
        'Update ACL Successfully...!!!',
        'bottom'
      );
    });

  }

}
