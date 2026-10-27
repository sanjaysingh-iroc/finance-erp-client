import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssociateModel } from '../associate.model';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { AssociateService } from '../associate.service';
import { MyErrorStateMatcher } from '../../shared/content-matching-error-state';
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

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.associateModel = history.state.associateModel;
      this.dialogTitle = 'Edit'
    } else {
      this.associateModel = new AssociateModel({});
    }

    this.associateService.getAllActiveAssociates(this.login.companyId).subscribe(associates => {
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
      name: [this.associateModel.name, [Validators.required]],
      fatherName: [this.associateModel.fatherName, [Validators.required]],
      email: [this.associateModel.email, [Validators.email, Validators.minLength(5)]],
      mobile: [this.associateModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      emergencyMobile: [this.associateModel.emergencyMobile, [Validators.pattern("^[0-9]{10}$")]],
      address: [this.associateModel.address, [Validators.required]],
      panNo: [this.associateModel.panNo],
      aadharNo: [this.associateModel.aadharNo],

      uploadImg: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]
    });

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


  onSubmit() {
    this.spinnerButtonOptions.active = true;
    const associate: AssociateModel = new AssociateModel(this.associatePersonalForm.value);
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
          this.router.navigate(['finance/associates/all-associates']);
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
