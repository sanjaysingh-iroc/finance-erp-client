import { Component, OnInit } from '@angular/core';
import { CustomerLoanModel, CustomerModel } from '../customer.model';
import { UtilsService } from '../../../shared/services/utils.service';
import { monthMap, settings, weekMap } from '../../../demo/data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CustomerService } from '../customer.service';
import { environment } from '@environments/environment';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { CompressImageService } from '../../../shared/services/CompressImageService';
import { LoginModel } from '../../../auth/login-model';

@Component({
  selector: 'app-about-customer',
  templateUrl: './about-customer.component.html',
  styleUrls: ['./about-customer.component.sass']
})
export class AboutCustomerComponent implements OnInit {

  customer: CustomerModel;
  showDateFormat: string;

  apiURL: string = environment.apiUrl;
  spinnerButtonOptions: MatProgressButtonOptions;
  customerLoanList: CustomerLoanModel[] = [];
  loanTotalPaidAmountMap: Map<number, number> = new Map<number, number>();
  customerLoanAmountMap: Map<number, string> = new Map<number, string>();
  login: LoginModel;

  constructor(
    private customerService: CustomerService,
    private utilsService: UtilsService,
    private compressImage: CompressImageService,
    private localStorageData: LocalStorageData,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private commonLayout: CommonLayout,
  ) {
    if (history.state.action != 'view') {
      this.router.navigate(['billing/finance/customers/all-customers']);
    }
  }

  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.customer = history.state.customer;
    this.login = this.localStorageData.userValue;
    this.customerService.getCustomerLoans(this.customer.id).subscribe(data => {
      this.customerLoanList = data;
    });


    this.customerService.calculateAmountByLoanId(this.login.companyId).subscribe(data => {
      data.forEach(loanTotalPaidAmount => {
        this.loanTotalPaidAmountMap.set(loanTotalPaidAmount[0], loanTotalPaidAmount[1]);
      });
    });

    this.customerService.getCustomerLoanByLastDeposit(this.login.companyId).subscribe(data => {
      data.forEach(customerLoanAmountModel => {
        this.customerLoanAmountMap.set(customerLoanAmountModel.loanId, customerLoanAmountModel.depositDate);
      });
    });
  }

  updateCustomerUrl(event, row) {
    event.target.src = "assets/images/user/avatar.png";
  }

}
