import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { MyErrorStateMatcher } from '../../shared/content-matching-error-state';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { ChangePasswordDto } from '../staff.model';
import { StaffService } from '../staff.service';
import { first } from 'rxjs/operators';
import { LocalStorageData } from '../../shared/local-storage-data';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationsService } from '../../shared/notifications-service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  changePassword: FormGroup;
  spinnerButtonOptions: MatProgressButtonOptions;
  oldPasswordHide = true;
  newPasswordHide = true;
  confirmPasswordHide = true;
  matcher = new MyErrorStateMatcher();
  constructor(
    private formBuilder: FormBuilder,
    private commonLayout: CommonLayout,
    private staffService: StaffService,
    private localStorageData: LocalStorageData,
    private notification: NotificationsService,

  ) {
    this.changePassword = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
  }

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group

    let oldPass = group.controls.oldPassword.value;
    let newPass = group.controls.newPassword.value;
    if (oldPass === newPass) {
      group.controls.confirmPassword.setErrors(null);
      return group.controls.newPassword.setErrors({ notSame: true });
    } else {
      group.controls.newPassword.setErrors(null);
      let confirmPass = group.controls.confirmPassword.value;
      return newPass == confirmPass ? group.controls.confirmPassword.setErrors(null) : group.controls.confirmPassword.setErrors({ notSame: true });
    }
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;
    const login = this.localStorageData.userValue;

    const subjectModel: ChangePasswordDto = new ChangePasswordDto(this.changePassword.value);
    this.staffService.changePassword(login.id, subjectModel)
      .pipe(first())
      .subscribe(
        data => {
          this.spinnerButtonOptions.active = false;
          this.changePassword.reset();
          this.notification.showSuccessNotification(
            'Password has been Reset Successfully...!!!',
            'bottom'
          );
        },
        (error: HttpErrorResponse) => {
          this.spinnerButtonOptions.active = false;
          this.changePassword.reset();
          this.notification.showDangerNotification(
            ' Old Password is Wrong...!!!',
            'bottom'
          );
        });

  }

}
