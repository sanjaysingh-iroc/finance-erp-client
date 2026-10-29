import { Component, OnInit } from '@angular/core';
import { CustomerLoanModel, CustomerModel } from '../customer.model';
import { UtilsService } from '../../shared/services/utils.service';
import { monthMap, settings, weekMap } from '../../demo/data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CustomerService } from '../customer.service';
import { environment } from '@environments/environment';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { LoginModel } from '../../auth/login-model';
import { AssociateService } from '../../associate/associate.service';
import { AssociateModel } from '../../associate/associate.model';

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
  completeCustomerLoanList: CustomerLoanModel[] = [];

  loanTotalPaidAmountMap: Map<number, number> = new Map<number, number>();
  login: LoginModel;

  associateMap: Map<number, AssociateModel> = new Map<number, AssociateModel>();
  constructor(
    private customerService: CustomerService,
    private utilsService: UtilsService,
    private compressImage: CompressImageService,
    private localStorageData: LocalStorageData,
    private associateService: AssociateService,

    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private commonLayout: CommonLayout,
  ) {
    if (history.state.action != 'view') {
      this.router.navigate(['finance/customers/all-customers']);
    }
  }

  ngOnInit(): void {
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.customer = history.state.customer;
    this.login = this.localStorageData.userValue;

    this.associateService.getAllActiveAssociates(this.login.companyId).subscribe(data => {
      data.forEach(customer => {
        this.associateMap.set(customer.id, customer);
      });
    });

    this.customerService.getCustomerLoans(this.customer.id).subscribe(data => {
      data.forEach(customerLoanModel => {
        if (customerLoanModel.complete) {
          this.completeCustomerLoanList.push(customerLoanModel);
        } else {
          this.customerLoanList.push(customerLoanModel);
        }
      });
    });

    this.customerService.calculateAmountByLoanId(this.login.companyId).subscribe(data => {
      data.forEach(loanTotalPaidAmount => {
        this.loanTotalPaidAmountMap.set(loanTotalPaidAmount[0], loanTotalPaidAmount[1]);
      });
    });


  }

  updateCustomerUrl(event, row) {
    event.target.src = "assets/images/user/avatar.png";
  }

}
