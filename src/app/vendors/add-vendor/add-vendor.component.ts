import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VendorModel } from '../vendor.model';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { VendorService } from '../vendor.service';
import { MyErrorStateMatcher } from '../../shared/content-matching-error-state';
import { GenderModel } from '../../shared/common.models';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { salutations } from '../../demo/data';
import { UtilsService } from '../../shared/services/utils.service';

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
  genderList: GenderModel[];
  matcher = new MyErrorStateMatcher();
  spinnerButtonOptions: MatProgressButtonOptions;
  salutations = salutations;

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

    this.utilsService.getAllGender().subscribe(data => {
      this.genderList = data;
    });

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.vendorModel = history.state.vendorModel;
      this.dialogTitle = 'Edit'
    } else {
      this.vendorModel = new VendorModel({});
    }

    this.vendorPersonalForm = this.fb.group({
      firmName: [this.vendorModel.firmName, [Validators.required]],
      salutation: [this.vendorModel.salutation, [Validators.required]],
      contactPersonName: [this.vendorModel.contactPersonName, [Validators.required]],
      gender: [this.vendorModel.gender > 0 ? this.vendorModel.gender : '', [Validators.required]],
      email: [this.vendorModel.email, [Validators.email, Validators.minLength(5)]],
      mobile: [this.vendorModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      emergencyMobile: [this.vendorModel.emergencyMobile, [Validators.pattern("^[0-9]{10}$")]],
      address: [this.vendorModel.address, [Validators.required]],
      details: [this.vendorModel.details, [Validators.required]],

      uploadImg: ['', [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]
    });

  }

  onSubmit() {
    this.spinnerButtonOptions.active = true;
    const vendor: VendorModel = new VendorModel(this.vendorPersonalForm.value);
    if (this.action == 'edit') {
      vendor.id = this.vendorModel.id;

      if (this.vendorPersonalForm.value.uploadImg) {
        let uploadImageData = new FormData();
        const file = this.vendorPersonalForm.value.uploadImg.files[0];
        uploadImageData.append("file", file);
        uploadImageData.append("vendorId", vendor.id + "");

        this.vendorService.uploadVendorsImage(uploadImageData).subscribe(
          (response) => {
            vendor.uploadImg = response.fileDownloadUri;
            this.updateVendor(vendor);
          }
        );

      } else {
        vendor.uploadImg = this.vendorModel.uploadImg;
        this.updateVendor(vendor);
      }
    } else {
      this.vendorService.addNewVendor(vendor)
        .pipe(first())
        .subscribe(
          (vendorData) => {
            if (this.vendorPersonalForm.value.uploadImg) {
              let uploadImageData = new FormData();
              const file = this.vendorPersonalForm.value.uploadImg.files[0];
              uploadImageData.append("file", file);
              uploadImageData.append("vendorId", vendorData.id + "");
              this.vendorService.uploadVendorsImage(uploadImageData).subscribe(
                (response) => {
                  vendorData.uploadImg = response.fileDownloadUri;
                  this.vendorService.addNewVendor(vendorData).subscribe(
                    (data) => {
                      this.router.navigate(['pages/vendors/all-vendors']);
                    });
                }
              );

            } else {
              this.router.navigate(['pages/vendors/all-vendors']);
            }
          });
    }

  }

  updateVendor(vendor) {
    this.vendorService.addNewVendor(vendor).subscribe(
      (data) => {

        this.router.navigate(['pages/vendors/all-vendors']);
      }
    );
  }
}
