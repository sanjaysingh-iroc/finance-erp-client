import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CompanyService } from '../company.service';
import { CompanyModel } from '../company.model';
import { NotificationsService } from '../../shared/notifications-service';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { CommonServices } from '../../shared/services/common-services';
import { UtilsService } from '../../shared/services/utils.service';
import { CountryModel, StateModel } from '../../shared/common.models';
import { forkJoin, of } from 'rxjs';
import { LoginModel } from '../../auth/login-model';
import { LocalStorageData } from '../../shared/local-storage-data';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.sass']
})
export class CompanyDetailsComponent implements OnInit {

  stdForm: FormGroup;
  maxDate: Date;
  spinnerButtonOptions: MatProgressButtonOptions;
  companyModel: CompanyModel = new CompanyModel({});
  minTimeMap: Map<string, string> = new Map<string, string>();
  stateModels: StateModel[];
  countryModels: CountryModel[];
  login: LoginModel;
  apiURL: string = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private notification: NotificationsService,
    private commonLayout: CommonLayout,
    private compressImage: CompressImageService,
    private utilsService: UtilsService,
    private localStorageData: LocalStorageData,
  ) {
  }

  ngOnInit(): void {
    this.minTimeMap.set('summer', '05:00 AM');
    this.minTimeMap.set('winter', '06:00 AM');
    this.login = this.localStorageData.userValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.maxDate = new Date();

    this.utilsService.getCountry().subscribe(data => {
      this.countryModels = data;
    });

    this.utilsService.getStates(1).subscribe(data => {
      this.stateModels = data;
    });
    this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(data => {
      if (data) {
        this.companyModel = data;
        this.stdForm.controls.companyName.setValue(data.companyName);
        this.stdForm.controls.companyPersonName.setValue(data.companyPersonName);

        this.stdForm.controls.companyCode.setValue(data.companyCode);

        this.stdForm.controls.establishmentDate.setValue(data.establishmentDate);
        this.stdForm.controls.email.setValue(data.email);
        this.stdForm.controls.website.setValue(data.website);

        this.stdForm.controls.mobile.setValue(data.mobile);
        this.stdForm.controls.phoneNo.setValue(data.phoneNo);
        this.stdForm.controls.address.setValue(data.address);

        this.stdForm.controls.district.setValue(data.district);
        this.stdForm.controls.panNo.setValue(data.panNo);
        this.stdForm.controls.countryId.setValue(data.countryId);
        this.stdForm.controls.stateId.setValue(data.stateId);
        this.stdForm.controls.pinCode.setValue(data.pinCode);

        this.stdForm.controls.gstNo.setValue(data.gstNo);

        this.stdForm.controls.bankName.setValue(data.bankName);
        this.stdForm.controls.accountNo.setValue(data.accountNo);
        this.stdForm.controls.ifsc.setValue(data.ifsc);
        this.stdForm.controls.bankAddress.setValue(data.bankAddress);


        this.stdForm.controls.summerStartTime.setValue(data.summerStartTime);
        this.stdForm.controls.summerEndTime.setValue(data.summerEndTime);
        this.stdForm.controls.winterStartTime.setValue(data.winterStartTime);
        this.stdForm.controls.winterEndTime.setValue(data.winterEndTime);

      }
    });

    this.stdForm = this.fb.group({
      companyName: ['', [Validators.required]],
      companyPersonName: ['', [Validators.required]],
      establishmentDate: [{ value: '', disabled: false }, [Validators.required]],
      companyCode: [''],
      gstNo: [''],
      email: ['', [Validators.email, Validators.minLength(5)]],
      website: [''],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      phoneNo: [''],
      address: ['', [Validators.required]],
      district: ['', [Validators.required]],
      panNo: [''],
      countryId: ['', [Validators.required]],
      stateId: ['', [Validators.required]],
      pinCode: [''],
      bankName: [''],
      accountNo: [''],
      ifsc: [''],
      bankAddress: [''],

      summerStartTime: ['', [Validators.required]],
      summerEndTime: ['', [Validators.required]],
      winterStartTime: ['', [Validators.required]],
      winterEndTime: ['', [Validators.required]],
      logoImg: [undefined, [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],
      upiImg: [undefined, [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],
      signImg: [undefined, [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],
      signWithStampImg: [undefined, [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]

    });
  }

  changeTime(summer: string) {
    const value = CommonServices.getTwentyFourHourTime(this.stdForm.get(summer + "EndTime").value) - CommonServices.getTwentyFourHourTime(this.stdForm.get(summer + "StartTime").value);
    if (value <= 0) {
      this.stdForm.get(summer + "EndTime").setValue('');
    }
    this.minTimeMap.set(summer, this.stdForm.get(summer + "StartTime").value);
  }

  updateCustomerUrl(event) {
    event.target.src = 'assets/images/blank_image.png';
  }

  onSubmit() {
    const companyModel: CompanyModel = new CompanyModel(this.stdForm.value);
    companyModel.id = this.companyModel.id;
    this.spinnerButtonOptions.active = true;

    this.uploadAllDoc(companyModel);
  }

  uploadAllDoc(companyModel: CompanyModel) {
    const apiCalls = {
      logoImg: this.uploadDoc(this.stdForm.value.logoImg),
      upiImg: this.uploadDoc(this.stdForm.value.upiImg),
      signImg: this.uploadDoc(this.stdForm.value.signImg),
      signWithStampImg: this.uploadDoc(this.stdForm.value.signWithStampImg),
    };

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        companyModel.logoImg = (results as any).logoImg.fileDownloadUri ? (results as any).logoImg.fileDownloadUri : this.companyModel.logoImg;
        companyModel.upiImg = (results as any).upiImg.fileDownloadUri ? (results as any).upiImg.fileDownloadUri : this.companyModel.upiImg;
        companyModel.signImg = (results as any).signImg.fileDownloadUri ? (results as any).signImg.fileDownloadUri : this.companyModel.signImg;
        companyModel.signWithStampImg = (results as any).signWithStampImg.fileDownloadUri ? (results as any).signWithStampImg.fileDownloadUri : this.companyModel.signWithStampImg;

        this.companyService.addNewCompany(companyModel).pipe(first()).subscribe((data) => {
          this.spinnerButtonOptions.active = false;
          this.companyModel = data;
          this.notification.showSuccessNotification(
            'Add Settings Successfully...!!!',
            'bottom'
          );
        });
      },
      error: (err) => console.error('One or more requests failed:', err)
    });
  }

  uploadDoc(uploadDoc) {
    if (uploadDoc) {
      let uploadImageData = new FormData();
      const file = uploadDoc.files[0];
      uploadImageData.append("file", file);
      uploadImageData.append("location", "company");
      return this.utilsService.uploadFile(uploadImageData);
    } else {
      return of({});;
    }
  }

}
