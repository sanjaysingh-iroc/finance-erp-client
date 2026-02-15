import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from "rxjs/operators";
import { Router } from "@angular/router";
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { settings } from '../../demo/data';
import { CustomerLeadService } from '../customer-lead.service';
import { CustomerLeadModel } from '../customer-lead.model';
import { formatDate } from '@angular/common';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';

@Component({
  selector: 'app-add-customer-lead',
  templateUrl: './add-customer-lead.component.html',
  styleUrls: ['./add-customer-lead.component.sass']
})

export class AddCustomerLeadComponent {
  action: string;
  dialogTitle: string = 'Add';
  customerLeadModel: CustomerLeadModel;
  customerPersonalForm: FormGroup;
  spinnerButtonOptions: MatProgressButtonOptions;
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();

  constructor(private fb: FormBuilder,
    private customerLeadService: CustomerLeadService,
    private staffService: StaffService,
    private commonLayout: CommonLayout,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.action = history.state.action;
    if (this.action == 'edit') {
      this.customerLeadModel = history.state.customerLeadModel;
      this.dialogTitle = 'Edit';
    } else {
      this.customerLeadModel = new CustomerLeadModel({});
    }

    this.staffService.getAllUsers().subscribe(data => {
      data.forEach(staffModel => this.staffMap.set(staffModel.id, staffModel));
    });

    const result = new Date();
    result.setDate(result.getDate() + 2);
    this.customerLeadModel.activityDate = formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en');
    this.customerLeadModel.nextActivityDate = formatDate(result, settings.SAVE_DATE_FORMAT, 'en');

    this.customerPersonalForm = this.fb.group({
      name: [this.customerLeadModel.name, [Validators.required]],
      email: [this.customerLeadModel.email],
      mobile: [this.customerLeadModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      address: [this.customerLeadModel.address, [Validators.required]],
      details: [this.customerLeadModel.details, [Validators.required]],
      activityDate: [this.customerLeadModel.activityDate, [Validators.required]],
      nextActivityDate: [this.customerLeadModel.nextActivityDate, [Validators.required]],
      activityAction: [this.customerLeadModel.activityAction, [Validators.required]],
      assignTo: [this.customerLeadModel.assignTo, [Validators.required]],

    });

  }

  onSubmit() {
    // this.spinnerButtonOptions.active = true;
    const customerLeadModel: CustomerLeadModel = new CustomerLeadModel(this.customerPersonalForm.value);
    if (this.action === 'edit') {
      customerLeadModel.id = this.customerLeadModel.id;
    }
    this.customerLeadService.addNewCustomerLead(customerLeadModel).pipe(first()).subscribe((customerData) => {
      this.router.navigate(['pages/customerLead/all-customers-lead']);
    });
  }
}
