import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssociateModel } from '../associate.model';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { AssociateService } from '../associate.service';
import { MyErrorStateMatcher } from '../../shared/content-matching-error-state';
import { UserTypeModel } from '../../shared/common.models';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { UtilsService } from '../../shared/services/utils.service';
import { LoginModel } from '../../auth/login-model';
import { forkJoin, of } from 'rxjs';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-add-associate',
  templateUrl: './add-associate.component.html',
  styleUrls: ['./add-associate.component.sass']
})

export class AddAssociateComponent {
  action: string;
  dialogTitle: string = 'Add';
  associateModel: AssociateModel;
  associatePersonalForm: FormGroup;
  associateProfessionalForm: FormGroup;

  userTypeList: UserTypeModel[];
  matcher = new MyErrorStateMatcher();
  minDate: Date;
  maxDate: Date;
  spinnerButtonOptions: MatProgressButtonOptions;
  hide = true;
  hide2 = true;
  associates: AssociateModel[] = [];
  associateMobiles: string[] = [];
  login: LoginModel;
  apiURL: string = environment.apiUrl;

  constructor(private fb: FormBuilder,
    private associateService: AssociateService,
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
      this.associateModel = history.state.associateModel;
      this.dialogTitle = 'Edit'
    } else {
      this.associateModel = new AssociateModel({}, {});
    }

    this.associateService.getAllActiveUsers(this.login.companyId, undefined).subscribe(associates => {
      this.associates = associates;
      associates.forEach(associate => {
        this.associateMobiles.push(associate.mobile);
      });

      if (this.action == 'edit') {
        const index = this.associateMobiles.indexOf(this.associateModel.mobile);
        this.associateMobiles.splice(index, 1);
      }
    });

    this.associatePersonalForm = this.fb.group({
      empCode: [this.associateModel.empCode, [Validators.required]],
      name: [this.associateModel.name, [Validators.required]],
      dob: [this.associateModel.dob, [Validators.required]],
      email: [this.associateModel.email, [Validators.email, Validators.minLength(5)]],
      mobile: [this.associateModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      emergencyMobile: [this.associateModel.emergencyMobile, [Validators.pattern("^[0-9]{10}$")]],
      address: [this.associateModel.address, [Validators.required]],
      uploadImg: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]
    });

    this.associateProfessionalForm = this.fb.group({
      dateOfJoining: [this.associateModel.dateOfJoining, [Validators.required]],
      salary: [this.associateModel.salary, [Validators.required]],
      password: [this.associateModel.password, [Validators.required]],
      confirmPassword: [this.associateModel.password, [Validators.required]],
      userType: [this.associateModel.userType, [Validators.required]],
      education: [this.associateModel.education, [Validators.required]]
    }, { validator: this.checkPasswords });

  }

  updateCustomerUrl(event) {
    event.target.src = 'assets/images/blank_image.png';
  }

  checkMobile() {
    const mobile = this.associatePersonalForm.get("mobile").value;
    if (this.associateMobiles.indexOf(mobile) >= 0) {
      this.associatePersonalForm.get('mobile').setErrors({ notSame: true });
    }
  }

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.controls.password.value;
    let confirmPass = group.controls.confirmPassword.value;
    return pass == confirmPass ? group.controls.confirmPassword.setErrors(null) : group.controls.confirmPassword.setErrors({ notSame: true });
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;
    const associate: AssociateModel = new AssociateModel(this.associatePersonalForm.value, this.associateProfessionalForm.value);
    associate.companyId = this.login.companyId;

    if (this.action == 'edit') {
      associate.id = this.associateModel.id;
      this.uploadAllDoc(associate);
    } else {
      this.associateService.addNewAssociate(associate).pipe(first()).subscribe((customerData) => {
        this.uploadAllDoc(customerData);
      });
    }
  }

  uploadAllDoc(associate: AssociateModel) {
    const apiCalls = {
      uploadImg: this.uploadDoc(associate.id, this.associatePersonalForm.value.uploadImg),
    };

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        associate.uploadImg = (results as any).uploadImg.fileDownloadUri ? (results as any).uploadImg.fileDownloadUri : this.associateModel.uploadImg;

        this.associateService.addNewAssociate(associate).pipe(first()).subscribe((customerData) => {
          const loginUser = this.localStorageData.userValue;
          if (associate.id == loginUser.id) {
            this.localStorageData.updateLoginUser(customerData);
          }

          this.router.navigate(['finance/finance/associate/all-associate']);
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
