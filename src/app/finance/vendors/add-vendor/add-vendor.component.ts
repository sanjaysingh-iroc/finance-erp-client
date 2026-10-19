import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VendorModel } from '../vendor.model';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { VendorService } from '../vendor.service';
import { MyErrorStateMatcher } from '../../../shared/content-matching-error-state';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CompressImageService } from '../../../shared/services/CompressImageService';
import { UtilsService } from '../../../shared/services/utils.service';
import { LoginModel } from '../../../auth/login-model';
import { forkJoin, of } from 'rxjs';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.sass']
})

export class AddVendorComponent {
  action: string;
  dialogTitle: string = 'Add';
  vendorModel: VendorModel;
  vendorPersonalForm: FormGroup;
  matcher = new MyErrorStateMatcher();
  spinnerButtonOptions: MatProgressButtonOptions;
  login: LoginModel;
  apiURL: string = environment.apiUrl;

  constructor(private fb: FormBuilder,
    private vendorService: VendorService,
    private utilsService: UtilsService,
    private compressImage: CompressImageService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.login = this.localStorageData.userValue;

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.vendorModel = history.state.vendorModel;
      this.dialogTitle = 'Edit'
    } else {
      this.vendorModel = new VendorModel({});
    }

    this.vendorPersonalForm = this.fb.group({
      firmName: [this.vendorModel.firmName, [Validators.required]],
      contactPersonName: [this.vendorModel.contactPersonName, [Validators.required]],
      email: [this.vendorModel.email, [Validators.email, Validators.minLength(5)]],
      mobile: [this.vendorModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      emergencyMobile: [this.vendorModel.emergencyMobile, [Validators.pattern("^[0-9]{10}$")]],
      address: [this.vendorModel.address, [Validators.required]],
      details: [this.vendorModel.details, [Validators.required]],

      uploadImg: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]
    });

  }

  updateCustomerUrl(event) {
    event.target.src = 'assets/images/blank_image.png';
  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;
    const vendor: VendorModel = new VendorModel(this.vendorPersonalForm.value);
    vendor.companyId = this.login.companyId;

    if (this.action == 'edit') {
      vendor.id = this.vendorModel.id;
      this.uploadAllDoc(vendor);
    } else {
      this.vendorService.addNewVendor(vendor).pipe(first()).subscribe((customerData) => {
        this.uploadAllDoc(customerData);
      });
    }
  }

  uploadAllDoc(vendor: VendorModel) {
    const apiCalls = {
      uploadImg: this.uploadDoc(vendor.id, this.vendorPersonalForm.value.uploadImg),
    };

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        vendor.uploadImg = (results as any).uploadImg.fileDownloadUri ? (results as any).uploadImg.fileDownloadUri : this.vendorModel.uploadImg;

        this.vendorService.addNewVendor(vendor).pipe(first()).subscribe((customerData) => {
          this.router.navigate(['billing/finance/vendors/all-vendors']);
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
      uploadImageData.append("location", "vendor");
      return this.utilsService.uploadFile(uploadImageData);
    } else {
      return of({});;
    }
  }


}
