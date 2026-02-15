import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerModel } from '../customer.model';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { CustomerService } from '../customer.service';
import { MyErrorStateMatcher } from '../../shared/content-matching-error-state';
import { CountryModel, GenderModel, StateModel } from '../../shared/common.models';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { salutations } from '../../demo/data';
import { UtilsService } from '../../shared/services/utils.service';

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

  genderList: GenderModel[];
  matcher = new MyErrorStateMatcher();
  spinnerButtonOptions: MatProgressButtonOptions;
  salutations = salutations;
  stateModels: StateModel[];
  countryModels: CountryModel[];

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

    this.utilsService.getAllGender().subscribe(data => {
      this.genderList = data;
    });

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
      name: [this.customerModel.name, [Validators.required]],
      contactPersonName: [this.customerModel.contactPersonName],
      salutation: [this.customerModel.salutation, [Validators.required]],
      gender: [this.customerModel.gender > 0 ? this.customerModel.gender : '', [Validators.required]],
      email: [this.customerModel.email, [Validators.email, Validators.minLength(5)]],
      mobile: [this.customerModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      emergencyMobile: [this.customerModel.emergencyMobile, [Validators.pattern("^[0-9]{10}$")]],
      address: [this.customerModel.address, [Validators.required]],
      district: [this.customerModel.district, [Validators.required]],
      countryId: [this.customerModel.countryId, [Validators.required]],
      stateId: [this.customerModel.stateId, [Validators.required]],
      pinCode: [this.customerModel.pinCode, [Validators.required]],
      details: [this.customerModel.details],
      companyName: [this.customerModel.name],
      panNo: [this.customerModel.panNo],
      gstNo: [this.customerModel.gstNo],
      uploadImg: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]],
      uploadDoc: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]

    });

  }

  onSubmit() {
    const login = this.localStorageData.userValue;

    this.spinnerButtonOptions.active = true;
    const customer: CustomerModel = new CustomerModel(this.customerPersonalForm.value);

    customer.createdBy = login.id;

    if (this.action == 'edit') {
      customer.id = this.customerModel.id;

      if (this.customerPersonalForm.value.uploadImg) {
        let uploadImageData = new FormData();
        const file = this.customerPersonalForm.value.uploadImg.files[0];
        uploadImageData.append("file", file);
        uploadImageData.append("customerId", customer.id + "");

        this.customerService.uploadCustomersImage(uploadImageData).subscribe(
          (response) => {
            customer.uploadImg = response.fileDownloadUri;
            this.updateCustomer(customer);
          }
        );

      } else {
        customer.uploadImg = this.customerModel.uploadImg;
        this.updateCustomer(customer);
      }
      if (this.customerPersonalForm.value.uploadDoc) {
        let uploadImageData = new FormData();
        const file = this.customerPersonalForm.value.uploadDoc.files[0];
        uploadImageData.append("file", file);
        uploadImageData.append("customerId", customer.id + "");

        this.customerService.uploadCustomersImage(uploadImageData).subscribe(
          (response) => {
            customer.uploadDoc = response.fileDownloadUri;
            this.updateCustomer(customer);
          }
        );

      } else {
        customer.uploadDoc = this.customerModel.uploadDoc;
        this.updateCustomer(customer);
      }

    } else {
      this.customerService.addNewCustomer(customer)
        .pipe(first())
        .subscribe(
          (customerData) => {
            if (this.customerPersonalForm.value.uploadImg) {
              let uploadImageData = new FormData();
              const file = this.customerPersonalForm.value.uploadImg.files[0];
              uploadImageData.append("file", file);
              uploadImageData.append("customerId", customerData.id + "");
              this.customerService.uploadCustomersImage(uploadImageData).subscribe(
                (response) => {
                  customerData.uploadImg = response.fileDownloadUri;
                  this.customerService.addNewCustomer(customerData).subscribe(
                    (data) => {
                      this.uploadDoc(customerData);
                    });
                }
              );

            } else {
              this.uploadDoc(customerData);
            }


          });
    }

  }

  uploadDoc(customerData) {
    if (this.customerPersonalForm.value.uploadDoc) {
      let uploadImageData = new FormData();
      const file = this.customerPersonalForm.value.uploadDoc.files[0];
      uploadImageData.append("file", file);
      uploadImageData.append("customerId", customerData.id + "");
      this.customerService.uploadCustomersImage(uploadImageData).subscribe(
        (response) => {
          customerData.uploadDoc = response.fileDownloadUri;
          this.customerService.addNewCustomer(customerData).subscribe(
            (data) => {
              this.router.navigate(['pages/customers/all-customers']);
            });
        }
      );

    } else {
      this.router.navigate(['pages/customers/all-customers']);
    }
  }

  updateCustomer(customer) {
    this.customerService.addNewCustomer(customer).subscribe(
      (data) => {

        this.router.navigate(['pages/customers/all-customers']);
      }
    );
  }
}
