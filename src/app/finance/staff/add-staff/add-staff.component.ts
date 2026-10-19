import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffModel } from '../staff.model';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { StaffService } from '../staff.service';
import { MyErrorStateMatcher } from '../../../shared/content-matching-error-state';
import { UserTypeModel } from '../../../shared/common.models';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CompressImageService } from '../../../shared/services/CompressImageService';
import { UtilsService } from '../../../shared/services/utils.service';
import { LoginModel } from '../../../auth/login-model';
import { forkJoin, of } from 'rxjs';
import { environment } from '@environments/environment';

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

  userTypeList: UserTypeModel[];
  matcher = new MyErrorStateMatcher();
  minDate: Date;
  maxDate: Date;
  spinnerButtonOptions: MatProgressButtonOptions;
  hide = true;
  hide2 = true;
  staffs: StaffModel[] = [];
  staffMobiles: string[] = [];
  login: LoginModel;
  apiURL: string = environment.apiUrl;

  constructor(private fb: FormBuilder,
    private staffService: StaffService,
    private utilsService: UtilsService,
    private compressImage: CompressImageService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    const maxDate: Date = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 14);
    this.maxDate = maxDate;

    const minDate: Date = new Date();
    minDate.setFullYear(minDate.getFullYear() - 60);
    this.minDate = minDate;

    this.utilsService.getAllUserType().subscribe(data => {
      this.userTypeList = data;
    });

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.staffModel = history.state.staffModel;
      this.dialogTitle = 'Edit'
    } else {
      this.staffModel = new StaffModel({}, {});
    }

    this.staffService.getAllActiveUsers(this.login.companyId, undefined).subscribe(staffs => {
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
      name: [this.staffModel.name, [Validators.required]],
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
      password: [this.staffModel.password, [Validators.required]],
      confirmPassword: [this.staffModel.password, [Validators.required]],
      userType: [this.staffModel.userType, [Validators.required]],
      education: [this.staffModel.education, [Validators.required]]
    }, { validator: this.checkPasswords });

  }

  updateCustomerUrl(event) {
    event.target.src = 'assets/images/blank_image.png';
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
    staff.companyId = this.login.companyId;

    if (this.action == 'edit') {
      staff.id = this.staffModel.id;
      this.uploadAllDoc(staff);
    } else {
      this.staffService.addNewStaff(staff).pipe(first()).subscribe((customerData) => {
        this.uploadAllDoc(customerData);
      });
    }
  }

  uploadAllDoc(staff: StaffModel) {
    const apiCalls = {
      uploadImg: this.uploadDoc(staff.id, this.staffPersonalForm.value.uploadImg),
    };

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        staff.uploadImg = (results as any).uploadImg.fileDownloadUri ? (results as any).uploadImg.fileDownloadUri : this.staffModel.uploadImg;

        this.staffService.addNewStaff(staff).pipe(first()).subscribe((customerData) => {
          const loginUser = this.localStorageData.userValue;
          if (staff.id == loginUser.id) {
            this.localStorageData.updateLoginUser(customerData);
          }

          this.router.navigate(['billing/finance/staff/all-staff']);
        });
      },
      error: (err) => console.error('One or more requests failed:', err)
    });
  }

  uploadDoc(id: number, uploadDoc) {
    if (uploadDoc) {
      let uploadImageData = new FormData();
      const file = uploadDoc.files[0];
      uploadImageData.append("file", file);
      uploadImageData.append("id", id + "");
      uploadImageData.append("location", "user");
      return this.utilsService.uploadFile(uploadImageData);
    } else {
      return of({});;
    }
  }

}
