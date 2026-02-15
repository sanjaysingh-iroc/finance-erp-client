import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { settings } from '../../demo/data';
import { CustomerLeadService } from '../customer-lead.service';
import { SolarCustomerModel } from '../customer-lead.model';
import { formatDate } from '@angular/common';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';
import { CompressImageService } from '../../shared/services/CompressImageService';

@Component({
  selector: 'app-add-solar-customer',
  templateUrl: './add-solar-customer.component.html',
  styleUrls: ['./add-solar-customer.component.sass']
})

export class AddSolarCustomerComponent {
  action: string;
  dialogTitle: string = 'Add';
  solarCustomerModel: SolarCustomerModel;
  customerPersonalForm: FormGroup;
  applicantPersonalForm: FormGroup;

  spinnerButtonOptions: MatProgressButtonOptions;

  constructor(private fb: FormBuilder,
    private customerLeadService: CustomerLeadService,
    private commonLayout: CommonLayout,
    private compressImage: CompressImageService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.action = history.state.action;
    if (this.action == 'edit') {
      this.solarCustomerModel = history.state.solarCustomerModel;
      this.dialogTitle = 'Edit';
    } else {
      this.solarCustomerModel = new SolarCustomerModel({}, {});
    }

    const result = new Date();
    result.setDate(result.getDate() + 2);
    this.solarCustomerModel.nextActivityDate = formatDate(result, settings.SAVE_DATE_FORMAT, 'en');

    this.customerPersonalForm = this.fb.group({
      name: [this.solarCustomerModel.name, [Validators.required]],
      email: [this.solarCustomerModel.email],
      mobile: [this.solarCustomerModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      emergencyMobile: [this.solarCustomerModel.emergencyMobile, [Validators.pattern("^[0-9]{10}$")]],

      address: [this.solarCustomerModel.address, [Validators.required]],
      electricityMeterNo: [this.solarCustomerModel.electricityMeterNo],
      uppclPassword: [this.solarCustomerModel.uppclPassword],
      aadharNo: [this.solarCustomerModel.aadharNo],
      panNo: [this.solarCustomerModel.panNo],
      bankName: [this.solarCustomerModel.bankName],
      bankIfsc: [this.solarCustomerModel.bankIfsc],
      bankAccountNo: [this.solarCustomerModel.bankAccountNo],
      productDetails: [this.solarCustomerModel.productDetails],

      pendingTask: [this.solarCustomerModel.pendingTask],
      nextActivityDate: [this.solarCustomerModel.nextActivityDate, [Validators.required]],
      uploadDoc: ['', [this.compressImage.fileMaxSize(10 * 1024 * 1024)]]
    });

    this.applicantPersonalForm = this.fb.group({
      applicantName: [this.solarCustomerModel.applicantName],
      applicantEmail: [this.solarCustomerModel.applicantEmail],
      applicantMobile: [this.solarCustomerModel.applicantMobile, [Validators.pattern("^[0-9]{10}$")]],
      applicantAadharNo: [this.solarCustomerModel.applicantAadharNo],
      applicantPanNo: [this.solarCustomerModel.applicantPanNo],
      applicantBankName: [this.solarCustomerModel.applicantBankName],
      applicantBankIfsc: [this.solarCustomerModel.applicantBankIfsc],
      applicantBankAccountNo: [this.solarCustomerModel.applicantBankAccountNo],
      applicantuploadDoc: ['', [this.compressImage.fileMaxSize(10 * 1024 * 1024)]]
    });

  }

  onSubmit() {
    const solarCustomerModel: SolarCustomerModel = new SolarCustomerModel(this.customerPersonalForm.value, this.applicantPersonalForm.value);
    if (this.action === 'edit') {
      solarCustomerModel.id = this.solarCustomerModel.id;
      solarCustomerModel.uploadDoc = this.solarCustomerModel.uploadDoc;
    }
    this.customerLeadService.addNewSolarCustomer(solarCustomerModel).pipe(first()).subscribe((customerData) => {
      if (this.customerPersonalForm.value.uploadDoc) {
        let uploadImageData = new FormData();
        const file = this.customerPersonalForm.value.uploadDoc.files[0];
        uploadImageData.append("file", file);
        uploadImageData.append("customerId", customerData.id + "");
        this.customerLeadService.uploadCustomerImage(uploadImageData).subscribe((response) => {
          customerData.uploadDoc = response.fileDownloadUri;
          this.customerLeadService.addNewSolarCustomer(customerData).subscribe(
            (data) => {
              this.router.navigate(['pages/customerLead/all-solar-customers']);
            });
        });
      } else {
        this.router.navigate(['pages/customerLead/all-solar-customers']);
      }
    });
  }
}
