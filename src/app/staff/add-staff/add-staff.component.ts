import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffModel } from '../staff.model';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { StaffService } from '../staff.service';
import { MyErrorStateMatcher } from '../../shared/content-matching-error-state';
import { GenderModel, UserTypeModel } from '../../shared/common.models';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { salutations } from '../../demo/data';
import { SessionModel } from '../../session/session.model';
import { SessionService } from '../../session/session.service';
import { UtilsService } from '../../shared/services/utils.service';

@Component({
  selector: 'app-add-staff',
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.sass']
})

export class AddStaffComponent {
  action: string;
  dialogTitle: string = 'Add';
  staffModel: StaffModel;
  staffPersonalForm: FormGroup;
  staffProfessionalForm: FormGroup;

  genderList: GenderModel[];
  userTypeList: UserTypeModel[];
  matcher = new MyErrorStateMatcher();
  sessionYearList: SessionModel[];
  minDate: Date;
  maxDate: Date;
  spinnerButtonOptions: MatProgressButtonOptions;
  hide = true;
  hide2 = true;
  staffs: StaffModel[] = [];
  staffMobiles: string[] = [];
  salutations = salutations;

  constructor(private fb: FormBuilder,
    private staffService: StaffService,
    private utilsService: UtilsService,
    private sessionService: SessionService,
    private compressImage: CompressImageService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    const maxDate: Date = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 14);
    this.maxDate = maxDate;

    const minDate: Date = new Date();
    minDate.setFullYear(minDate.getFullYear() - 60);
    this.minDate = minDate;

    this.sessionService.getAllCurrentAndUpcomingSessionYears().subscribe(data => {
      this.sessionYearList = data;
    });

    this.utilsService.getAllGender().subscribe(data => {
      this.genderList = data;
    });

    this.utilsService.getAllUserType().subscribe(data => {
      this.userTypeList = data;
    });

    const session = this.localStorageData.sessionValue;

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.staffModel = history.state.staffModel;
      this.dialogTitle = 'Edit'
    } else {
      this.staffModel = new StaffModel({}, {});
    }

    this.staffService.getAllActiveUsers(session.id, undefined).subscribe(staffs => {
      this.staffs = staffs;
      staffs.forEach(staff => {
        this.staffMobiles.push(staff.mobile);
      });

      if (this.action == 'edit') {
        const index = this.staffMobiles.indexOf(this.staffModel.mobile);
        this.staffMobiles.splice(index, 1);
      }
    });

    this.staffPersonalForm = this.fb.group({
      empCode: [this.staffModel.empCode, [Validators.required]],
      salutation: [this.staffModel.salutation, [Validators.required]],
      name: [this.staffModel.name, [Validators.required]],
      gender: [this.staffModel.gender > 0 ? this.staffModel.gender : '', [Validators.required]],
      dob: [this.staffModel.dob, [Validators.required]],
      email: [this.staffModel.email, [Validators.email, Validators.minLength(5)]],
      mobile: [this.staffModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      emergencyMobile: [this.staffModel.emergencyMobile, [Validators.pattern("^[0-9]{10}$")]],
      address: [this.staffModel.address, [Validators.required]],
      uploadImg: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]
    });

    this.staffProfessionalForm = this.fb.group({
      dateOfJoining: [this.staffModel.dateOfJoining, [Validators.required]],
      salary: [this.staffModel.salary, [Validators.required]],
      sessionYear: [this.staffModel.sessionYear, [Validators.required]],
      password: [this.staffModel.password, [Validators.required]],
      confirmPassword: [this.staffModel.password, [Validators.required]],
      userType: [this.staffModel.userType, [Validators.required]],
      education: [this.staffModel.education, [Validators.required]]
    }, { validator: this.checkPasswords });

  }

  checkMobile() {
    const mobile = this.staffPersonalForm.get("mobile").value;
    if (this.staffMobiles.indexOf(mobile) >= 0) {
      this.staffPersonalForm.get('mobile').setErrors({ notSame: true });
    }
  }

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.controls.password.value;
    let confirmPass = group.controls.confirmPassword.value;
    return pass == confirmPass ? group.controls.confirmPassword.setErrors(null) : group.controls.confirmPassword.setErrors({ notSame: true });
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;
    const staff: StaffModel = new StaffModel(this.staffPersonalForm.value, this.staffProfessionalForm.value);
    if (this.action == 'edit') {
      staff.id = this.staffModel.id;

      if (this.staffPersonalForm.value.uploadImg) {
        let uploadImageData = new FormData();
        const file = this.staffPersonalForm.value.uploadImg.files[0];
        uploadImageData.append("file", file);
        uploadImageData.append("staffId", staff.id + "");

        this.staffService.uploadStaffsImage(uploadImageData).subscribe(
          (response) => {
            staff.uploadImg = response.fileDownloadUri;
            this.updateStaff(staff);
          }
        );

      } else {
        staff.uploadImg = this.staffModel.uploadImg;
        this.updateStaff(staff);
      }
    } else {
      this.staffService.addNewStaff(staff)
        .pipe(first())
        .subscribe(
          (staffData) => {
            if (this.staffPersonalForm.value.uploadImg) {
              let uploadImageData = new FormData();
              const file = this.staffPersonalForm.value.uploadImg.files[0];
              uploadImageData.append("file", file);
              uploadImageData.append("staffId", staffData.id + "");
              this.staffService.uploadStaffsImage(uploadImageData).subscribe(
                (response) => {
                  staffData.uploadImg = response.fileDownloadUri;
                  this.staffService.addNewStaff(staffData).subscribe(
                    (data) => {
                      this.router.navigate(['pages/staff/all-staff']);
                    });
                }
              );

            } else {
              this.router.navigate(['pages/staff/all-staff']);
            }
          });
    }

  }

  updateStaff(staff) {
    this.staffService.addNewStaff(staff).subscribe(
      (data) => {

        const loginUser = this.localStorageData.userValue;
        if (staff.id == loginUser.id) {
          this.localStorageData.updateLoginUser(data);
        }

        this.router.navigate(['pages/staff/all-staff']);
      }
    );
  }
}
