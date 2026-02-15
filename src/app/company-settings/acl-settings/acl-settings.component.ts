import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CompanyService } from '../company.service';
import { RouteInfoModel, UpdateAclInfoModel } from '../company.model';
import { NotificationsService } from '../../shared/notifications-service';
import { UserTypeModel } from '../../shared/common.models';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { UtilsService } from '../../shared/services/utils.service';

@Component({
  selector: 'app-acl-settings',
  templateUrl: './acl-settings.component.html',
  styleUrls: ['./acl-settings.component.sass']
})
export class AclSettingsComponent implements OnInit {

  stdForm: FormGroup;
  public sidebarItems: RouteInfoModel[];
  public userTypeList: UserTypeModel[] = [];
  selectmap: Map<number, boolean> = new Map<number, boolean>();
  spinnerButtonOptions: MatProgressButtonOptions;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
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
    this.companyService.getAllNavigationDetails().subscribe(
      data => {
        this.sidebarItems = data.filter(sidebarItem => sidebarItem);
      }
    );

  }

  getAllNavigationAclDetails() {
    this.companyService.getAllNavigationAclDetails(this.stdForm.get('userType').value).subscribe(
      data => {
        this.selectmap.clear();
        data.forEach(element => this.selectmap.set(element.navigationId, true));
      }
    );

  }

  toggle(event, navigationId) {
    this.selectmap.set(navigationId, event.checked);
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;

    const userType = this.stdForm.get('userType').value;
    let updateAclInfoModel: UpdateAclInfoModel = new UpdateAclInfoModel();
    let navigationIds: number[] = [];
    for (let isSelect of this.selectmap.entries()) {
      if (isSelect[1]) {
        navigationIds.push(isSelect[0]);
      }
    }
    updateAclInfoModel.userTypeId = userType;
    updateAclInfoModel.navigationIds = navigationIds;
    this.companyService.updateNavigationAclDetails(updateAclInfoModel)
      .pipe(first())
      .subscribe(
        data => {
          this.spinnerButtonOptions.active = false;
          this.notification.showSuccessNotification(
            'Update ACL Successfully...!!!',
            'bottom'
          );
        });

  }

}
