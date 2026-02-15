import { Component, OnInit } from '@angular/core';
import { LoginModel } from '../../auth/login-model';
import { LocalStorageData } from '../../shared/local-storage-data';
import { NotificationsService } from '../../shared/notifications-service';
import { StaffService } from '../../staff/staff.service';
import { NotificationResponseModel } from '../notification.model';
import { NotificationService } from '../notification.service';


@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {

  notifications: NotificationResponseModel[] = [];
  staffMap: Map<number, string> = new Map<number, string>();
  selectmap: Map<number, number> = new Map<number, number>();
  login: LoginModel;
  isStaff: boolean = true;
  constructor(
    private notificationService: NotificationService,
    private staffService: StaffService,
    private notification: NotificationsService,
    private localStorageData: LocalStorageData,
  ) { }
  ngOnInit() {
    this.login = this.localStorageData.userValue;
    if (this.login) {
      this.notificationService.getAllNotification(undefined, this.login.id).subscribe((data) => {
        this.notifications = data;
      });
    } else {
      this.login = this.localStorageData.customerValue;
      this.notificationService.getAllNotification(this.login.id, undefined).subscribe((data) => {
        this.notifications = data;
      });
      this.isStaff = false;
    }


    this.staffService.getAllUsers().subscribe(data => {
      data.forEach((staff) => {
        this.staffMap.set(staff.id, staff.name);
      });
    });
  }

  toggle(event, navigationId) {
    this.selectmap.set(navigationId, event.checked);
  }

  removeSelectedRows() {
    const ids = [];
    this.selectmap.forEach((value, key) => {
      if (value) {
        ids.push(key);
      }

    });

    this.notificationService.deleteNotifications(ids.toString(), !this.isStaff ? this.login.id : undefined, this.isStaff ? this.login.id : undefined).subscribe(() => {
      let notificationids: number[] = [];
      this.selectmap.forEach((value, key) => {
        if (value) {
          notificationids.push(key);
          const foundIndex = this.notifications.findIndex((x) => x.notification.id === key);
          this.notifications.splice(foundIndex, 1);
        }
      });

      this.notificationService.emitData(notificationids);
      this.selectmap.clear();
      this.notification.showDangerNotification(
        'All Selected Record Delete Successfully...!!!',
        'bottom'
      );
    });
  }
}
