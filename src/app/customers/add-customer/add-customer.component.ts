import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerModel } from '../customer.model';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { CustomerService } from '../customer.service';
import { CountryModel, StateModel } from '../../shared/common.models';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { UtilsService } from '../../shared/services/utils.service';
import { forkJoin, of } from 'rxjs';
import { MyErrorStateMatcher } from '../../shared/content-matching-error-state';

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
  customerSpousePersonalForm: FormGroup;
  customerForm: FormGroup;

  spinnerButtonOptions: MatProgressButtonOptions;
  stateModels: StateModel[];
  countryModels: CountryModel[];

  hide = true;
  hide2 = true;
  matcher = new MyErrorStateMatcher();

  constructor(private fb: FormBuilder,
    private customerService: CustomerService,
    private utilsService: UtilsService,
    private compressImage: CompressImageService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();

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
      this.customerModel = new CustomerModel({}, {}, {});
    }

    this.customerPersonalForm = this.fb.group({
      name: [this.customerModel.name, [Validators.required]],
      email: [this.customerModel.email, [Validators.email, Validators.minLength(5)]],
      mobile: [this.customerModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      panNo: [this.customerModel.panNo],
      aadharNo: [this.customerModel.aadharNo],
      password: [this.customerModel.password, [Validators.required]],
      confirmPassword: [this.customerModel.password, [Validators.required]],

      uploadImg: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],
      uploadAadhar: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],
      uploadPan: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]

    }, { validator: this.checkPasswords });

    this.customerSpousePersonalForm = this.fb.group({
      name: [this.customerModel.spouseName, [Validators.required]],
      mobile: [this.customerModel.spouseMobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      panNo: [this.customerModel.spousePanNo],
      aadharNo: [this.customerModel.spouseAadharNo],
      uploadSpouseImg: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],
      spouseUploadAadhar: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],
      spouseUploadPan: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]

    });

    this.customerForm = this.fb.group({
      address: [this.customerModel.address, [Validators.required]],
      district: [this.customerModel.district, [Validators.required]],
      countryId: [this.customerModel.countryId, [Validators.required]],
      stateId: [this.customerModel.stateId, [Validators.required]],
      pinCode: [this.customerModel.pinCode, [Validators.required]],
      details: [this.customerModel.details]
    });

  }

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.controls.password.value;
    let confirmPass = group.controls.confirmPassword.value;
    return pass == confirmPass ? group.controls.confirmPassword.setErrors(null) : group.controls.confirmPassword.setErrors({ notSame: true });
  }


  onSubmit() {
    const login = this.localStorageData.userValue;
    this.spinnerButtonOptions.active = true;
    const customer: CustomerModel = new CustomerModel(this.customerPersonalForm.value, this.customerSpousePersonalForm.value, this.customerForm.value);

    console.log(customer)
    if (this.action == 'edit') {
      customer.id = this.customerModel.id;
      this.uploadAllDoc(customer);
    } else {
      this.customerService.addNewCustomer(customer).pipe(first()).subscribe((customerData) => {
        this.uploadAllDoc(customerData);
      });
    }
  }

  uploadAllDoc(customerData: CustomerModel) {
    const apiCalls = {
      customerImg: this.uploadDoc(customerData.id, this.customerPersonalForm.value.uploadImg),
      customerAadhar: this.uploadDoc(customerData.id, this.customerPersonalForm.value.uploadAadhar),
      customerPan: this.uploadDoc(customerData.id, this.customerPersonalForm.value.uploadPan),

      spouseImg: this.uploadDoc(customerData.id, this.customerSpousePersonalForm.value.uploadSpouseImg),
      spouseAadhar: this.uploadDoc(customerData.id, this.customerSpousePersonalForm.value.spouseUploadAadhar),
      spousePan: this.uploadDoc(customerData.id, this.customerSpousePersonalForm.value.spouseUploadPan),
    };

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        customerData.uploadImg = (results as any).customerImg.fileDownloadUri ? (results as any).customerImg.fileDownloadUri : this.customerModel.uploadImg;
        customerData.uploadAadhar = (results as any).customerAadhar.fileDownloadUri ? (results as any).customerAadhar.fileDownloadUri : this.customerModel.uploadAadhar;
        customerData.uploadPan = (results as any).customerPan.fileDownloadUri ? (results as any).customerPan.fileDownloadUri : this.customerModel.uploadPan;

        customerData.uploadSpouseImg = (results as any).spouseImg.fileDownloadUri ? (results as any).spouseImg.fileDownloadUri : this.customerModel.uploadSpouseImg;
        customerData.spouseUploadAadhar = (results as any).spouseAadhar.fileDownloadUri ? (results as any).spouseAadhar.fileDownloadUri : this.customerModel.spouseUploadAadhar;
        customerData.spouseUploadPan = (results as any).spousePan.fileDownloadUri ? (results as any).spousePan.fileDownloadUri : this.customerModel.spouseUploadPan;

        this.customerService.addNewCustomer(customerData).pipe(first()).subscribe((customerData) => {
          this.router.navigate(['pages/customers/all-customers']);
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
      uploadImageData.append("customerId", id + "");
      return this.customerService.uploadCustomersImage(uploadImageData);

    } else {
      return of({});;
    }

  }
}
