import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { CustomerService } from '../customer.service';
import { CustomerLoanModel, CustomerModel } from '../customer.model';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { SessionModel } from '../../../session/session.model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { formatDate } from '@angular/common';
import { settings } from '../../../demo/data';
import { BillingService } from '../../billing/billing.service';
import { BillingModel } from '../../billing/billing.model';
import { CompressImageService } from '../../../shared/services/CompressImageService';
import { Utils } from '../../../shared/util-class';
import { LoginModel } from '../../../auth/login-model';
import { environment } from '@environments/environment';


@Component({
  selector: 'app-add-customer-loan',
  templateUrl: './add-customer-loan.component.html',
  styleUrls: ['./add-customer-loan.component.css']
})
export class AddCustomerLoanComponent implements OnInit {
  action: string;
  dialogTitle: string = 'Add';
  customerLoanModel: CustomerLoanModel;
  customerLoansForm: FormGroup;
  session: SessionModel;
  spinnerButtonOptions: MatProgressButtonOptions;
  allBillingsMap: Map<number, BillingModel> = new Map<number, BillingModel>();
  allCustomersMap: Map<number, CustomerModel> = new Map<number, CustomerModel>();

  invoiceList: number[] = [];
  selectedCustomer: CustomerModel = new CustomerModel({});
  maxLoanAmountControl = new FormControl('0');
  selectedBillingModel: BillingModel;
  login: LoginModel;
  apiURL: string = environment.apiUrl;
  amountInWords: string[] = [];

  constructor(private fb: FormBuilder,
    private customerService: CustomerService,
    private billingService: BillingService,
    private compressImage: CompressImageService,
    public utils: Utils,

    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.session = this.localStorageData.sessionValue;

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.customerLoanModel = history.state.customerLoanModel;
      this.dialogTitle = 'Edit';
    } else {
      this.customerLoanModel = new CustomerLoanModel({});
      this.customerLoanModel.customerLoanDate = formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en');
    }

    this.customerLoansForm = this.fb.group({
      invoiceId: [this.customerLoanModel.invoiceId, [Validators.required]],

      customerLoanDate: [this.customerLoanModel.customerLoanDate, [Validators.required]],

      amount: [this.customerLoanModel.amount, [Validators.required, Validators.min(0)]],
      interestAmount: [this.customerLoanModel.interestAmount, [Validators.required, Validators.min(0)]],
      emiAmount: [this.customerLoanModel.emiAmount, [Validators.required, Validators.min(0)]],
      guarantorName: [this.customerLoanModel.guarantorName],
      guarantorMobile: [this.customerLoanModel.guarantorMobile],
      comment: [this.customerLoanModel.comment],
      uploadDoc: [undefined, [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]

    });


    this.customerService.getAllCustomerLoans(this.login.companyId).subscribe(data => {
      data.forEach(customerLoanModel => {
        this.invoiceList.push(customerLoanModel.invoiceId);
      });
      this.billingService.getAllLoanBillings(this.login.companyId).subscribe(data => {
        const customerList: number[] = [];
        data.forEach(billingModel => {
          if (this.invoiceList.indexOf(billingModel.id) < 0 || billingModel.id == this.customerLoanModel.invoiceId) {
            this.allBillingsMap.set(billingModel.id, billingModel);
            customerList.push(billingModel.customerId);
          }
        });

        if (customerList.length > 0) {
          this.customerService.getAllCustomersByIds(customerList).subscribe(data => {
            data.forEach(customerModel => {
              this.allCustomersMap.set(customerModel.id, customerModel);

            });
            if (this.action == 'edit') {
              this.getInvoiceData(this.customerLoanModel.invoiceId);
            }
          });
        }

      });



    });

  }

  updateCustomerUrl(event) {
    event.target.src = 'assets/images/blank_image.png';
  }

  onInvoiceSelect(event) {
    this.getInvoiceData(event.value);
  }

  getInvoiceData(id: number) {
    this.selectedBillingModel = this.allBillingsMap.get(id);
    this.selectedCustomer = this.allCustomersMap.get(this.selectedBillingModel.customerId);
    const totalAmount = this.selectedBillingModel?.totalAmount - this.selectedBillingModel?.roundOffAmount;
    this.maxLoanAmountControl.setValue(totalAmount);
  }

  onPriceChange(index, event) {
    const totalAmount = this.selectedBillingModel?.totalAmount - this.selectedBillingModel?.roundOffAmount;
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    if (amount > totalAmount) {
      this.customerLoansForm.get('amount').setErrors({ notSame: true });
    }
    this.convertAmountInWords(index, amount);
  }

  convertAmtInWords(index: number, event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.convertAmountInWords(index, amount);
  }

  convertAmountInWords(index: number, amount: number) {
    this.amountInWords[index] = this.utils.convertToWords(amount);
  }

  onSubmit() {
    // this.spinnerButtonOptions.active = true;
    this.customerService.getMaxCustomerLoanId(this.login.companyId).subscribe(data => {
      const loanName: string = 'LOAN/' + this.session.name + '/' + this.utils.formatToThreeDigits(data + 1, 3, '0')
      this.addNewCustomerLoanModel(loanName);
    });
  }

  addNewCustomerLoanModel(loanName: string) {
    const login = this.localStorageData.userValue;

    const customerLoansModel: CustomerLoanModel = new CustomerLoanModel(this.customerLoansForm.value);
    customerLoansModel.companyId = this.login.companyId;

    customerLoansModel.customerId = this.selectedCustomer.id;
    customerLoansModel.customerLoanDate = formatDate(this.customerLoansForm.get("customerLoanDate").value, settings.SAVE_DATE_FORMAT, 'en');
    customerLoansModel.createdBy = login.id;

    if (this.action == 'edit') {
      customerLoansModel.id = this.customerLoanModel.id;
      customerLoansModel.customerLoanName = this.customerLoanModel.customerLoanName;
    } else {
      customerLoansModel.customerLoanName = loanName;
    }
    this.customerService.addNewCustomerLoan(customerLoansModel).subscribe((data) => {
      this.router.navigate(['billing/finance/customers/all-customer-loans']);
    });

  }
}
