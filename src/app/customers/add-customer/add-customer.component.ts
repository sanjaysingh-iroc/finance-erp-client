import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerModel } from '../customer.model';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { CustomerService } from '../customer.service';
import { MyErrorStateMatcher } from '../../shared/content-matching-error-state';
import { CountryModel, StateModel } from '../../shared/common.models';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { UtilsService } from '../../shared/services/utils.service';
import { LoginModel } from '../../auth/login-model';
import { CompanyModel } from '../../company-settings/company.model';
import { CompanyService } from '../../company-settings/company.service';
import { forkJoin, of } from 'rxjs';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.sass']
})

export class AddCustomerComponent {
  action: string;
  dialogTitle: string = 'Add';
  customerModel: CustomerModel;
  customerPersonalForm: FormGroup;

  matcher = new MyErrorStateMatcher();
  spinnerButtonOptions: MatProgressButtonOptions;
  stateModels: StateModel[];
  countryModels: CountryModel[];
  login: LoginModel;
  apiURL: string = environment.apiUrl;

  constructor(private fb: FormBuilder,
    private customerService: CustomerService,
    private utilsService: UtilsService,
    private compressImage: CompressImageService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private companyService: CompanyService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.login = this.localStorageData.userValue;

    this.utilsService.getCountry().subscribe(data => {
      this.countryModels = data;
    });

    this.utilsService.getStates(1).subscribe(data => {
      this.stateModels = data;
    });

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.customerModel = history.state.customerModel;
      this.dialogTitle = 'Edit'
    } else {
      this.customerModel = new CustomerModel({});
    }

    this.customerPersonalForm = this.fb.group({
      name: [this.customerModel.name],
      fatherName: [this.customerModel.fatherName],
      email: [this.customerModel.email, [Validators.email, Validators.minLength(5)]],
      mobile: [this.customerModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      emergencyMobile: [this.customerModel.emergencyMobile, [Validators.pattern("^[0-9]{10}$")]],
      address: [this.customerModel.address, [Validators.required]],
      location: [this.customerModel.location],
      district: [this.customerModel.district, [Validators.required]],
      countryId: [this.customerModel.countryId, [Validators.required]],
      stateId: [this.customerModel.stateId, [Validators.required]],
      pinCode: [this.customerModel.pinCode, [Validators.required]],
      details: [this.customerModel.details],
      panNo: [this.customerModel.panNo],
      aadharNo: [this.customerModel.aadharNo],
      uploadImg: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],
      uploadAdharDoc: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],
      uploadPanDoc: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]

    });

    this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }
      this.customerPersonalForm.get('district').setValue(companyModel.district);
      this.customerPersonalForm.get('pinCode').setValue(companyModel.pinCode);
      this.customerPersonalForm.get('stateId').setValue(companyModel.stateId);

    });

  }

  updateCustomerUrl(event) {
    event.target.src = 'assets/images/blank_image.png';
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;
    const customer: CustomerModel = new CustomerModel(this.customerPersonalForm.value);
    customer.companyId = this.login.companyId;
    customer.createdBy = this.login.id;

    if (this.action == 'edit') {
      customer.id = this.customerModel.id;
      this.uploadAllDoc(customer);
    } else {
      this.customerService.addNewCustomer(customer).subscribe((customerData) => {
        this.uploadAllDoc(customerData);
      });
    }
  }

  uploadAllDoc(customerData: CustomerModel) {
    const apiCalls = {
      uploadAdharDoc: this.uploadDoc(customerData.id, this.customerPersonalForm.value.uploadAdharDoc),
      uploadPanDoc: this.uploadDoc(customerData.id, this.customerPersonalForm.value.uploadPanDoc),
      uploadImg: this.uploadDoc(customerData.id, this.customerPersonalForm.value.uploadImg),

    };

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        customerData.uploadAdharDoc = (results as any).uploadAdharDoc.fileDownloadUri ? (results as any).uploadAdharDoc.fileDownloadUri : this.customerModel.uploadAdharDoc;
        customerData.uploadPanDoc = (results as any).uploadPanDoc.fileDownloadUri ? (results as any).uploadPanDoc.fileDownloadUri : this.customerModel.uploadPanDoc;

        customerData.uploadImg = (results as any).uploadImg.fileDownloadUri ? (results as any).uploadImg.fileDownloadUri : this.customerModel.uploadImg;

        this.customerService.addNewCustomer(customerData).subscribe((customerData) => {
          this.router.navigate(['finance/customers/all-customers']);

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
      uploadImageData.append("location", "customer");
      return this.utilsService.uploadFile(uploadImageData);
    } else {
      return of({});;
    }
  }
}
