import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { first, map, startWith } from 'rxjs/operators';
import { CustomerService } from '../customer.service';
import { CustomerLoanAmountModel, CustomerLoanModel, CustomerModel } from '../customer.model';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { formatDate } from '@angular/common';
import { settings } from '../../../demo/data';
import { Observable } from 'rxjs';
import { CompressImageService } from '../../../shared/services/CompressImageService';
import { LoginModel } from '../../../auth/login-model';
import { Utils } from '../../../shared/util-class';


@Component({
  selector: 'app-add-customer-loan-amount',
  templateUrl: './add-customer-loan-amount.component.html',
  styleUrls: ['./add-customer-loan-amount.component.css']
})
export class AddCustomerLoanAmountComponent implements OnInit {
  action: string;
  dialogTitle: string = 'Add';
  customerLoanAmountModel: CustomerLoanAmountModel;
  customerLoansForm: FormGroup;
  spinnerButtonOptions: MatProgressButtonOptions;
  customerMap: Map<number, CustomerModel> = new Map<number, CustomerModel>();
  selectedCustomer: CustomerModel = new CustomerModel({});

  customerDetails = new FormControl(null, [
    Validators.required,
    this.forbiddenNamesValidator()
  ]);
  customers: CustomerModel[] = [];
  filteredOptions: Observable<CustomerModel[]>;
  allCustomerLoanModels: CustomerLoanModel[];
  allCustomerLoanMap: Map<number, CustomerLoanModel> = new Map<number, CustomerLoanModel>();
  loanTotalPaidAmountMap: Map<number, number> = new Map<number, number>();

  paidAmountControl = new FormControl('0');
  pendingAmountControl = new FormControl('0');
  totalAmountControl = new FormControl('0');
  login: LoginModel;
  amountInWords: string;

  constructor(private fb: FormBuilder,
    private customerService: CustomerService,
    private compressImage: CompressImageService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    public utils: Utils,

    private router: Router
  ) { }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.customerLoanAmountModel = history.state.customerLoanAmountModel;
      this.dialogTitle = 'Edit';
      this.customerService.calculateAmountByLoanId(this.login.companyId).subscribe(data => {
        data.forEach(loanTotalPaidAmount => {
          this.loanTotalPaidAmountMap.set(loanTotalPaidAmount[0], loanTotalPaidAmount[1]);
        });

        this.customerService.getCustomerCompleteLoans(this.customerLoanAmountModel.customerId, false).subscribe(data => {
          this.allCustomerLoanModels = data;
          data.forEach(customerLoan => {
            this.allCustomerLoanMap.set(customerLoan.id, customerLoan);
          });

          const totalAmount = this.allCustomerLoanMap.get(this.customerLoanAmountModel.loanId)?.amount;
          const paidAmount = (this.loanTotalPaidAmountMap.get(this.customerLoanAmountModel.loanId) ? this.loanTotalPaidAmountMap.get(this.customerLoanAmountModel.loanId) : 0) - this.customerLoanAmountModel.amount;

          this.paidAmountControl.setValue(paidAmount);
          this.pendingAmountControl.setValue(totalAmount - paidAmount);
          this.totalAmountControl.setValue(totalAmount);

        });

      });
    } else {
      this.customerService.calculateAmountByLoanId(this.login.companyId).subscribe(data => {
        data.forEach(loanTotalPaidAmount => {
          this.loanTotalPaidAmountMap.set(loanTotalPaidAmount[0], loanTotalPaidAmount[1]);
        });
      });
      this.customerLoanAmountModel = new CustomerLoanAmountModel({});
      this.customerLoanAmountModel.depositDate = formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en')
    }


    const loanCustomers: number[] = [];
    this.customerService.getAllCompleteCustomerLoans(this.login.companyId, false).subscribe(data => {
      data.forEach(customerLoan => {
        loanCustomers.push(customerLoan.customerId);
        this.allCustomerLoanMap.set(customerLoan.id, customerLoan);
      });
      this.getCustomeLoanList(loanCustomers);
    });


    this.customerLoansForm = this.fb.group({
      customerDetails: this.customerDetails,
      loanId: [this.customerLoanAmountModel.loanId, [Validators.required]],

      depositDate: [this.customerLoanAmountModel.depositDate, [Validators.required]],
      amount: [this.customerLoanAmountModel.amount, [Validators.required, Validators.min(1)]],
      comment: [this.customerLoanAmountModel.comment],
      uploadDoc: [undefined, [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]

    });
  }

  getCustomeLoanList(loanCustomers: number[]) {
    this.customerService.getAllCustomers(this.login.companyId).subscribe(data => {
      this.customerDetails.reset(null);
      this.customers = [];
      data.forEach(customer => {
        if (loanCustomers.indexOf(customer.id) >= 0) {
          this.customerMap.set(customer.id, customer);
          this.customers.push(customer);
        }

      });

      this.selectedCustomer = this.customerMap.get(this.customerLoanAmountModel.customerId);

      this.customers.sort((a, b) => a.name.localeCompare(b.name));
      this.filteredOptions = this.customerDetails.valueChanges.pipe(
        startWith<any>({ id: 0, name: "" }),
        map(value => (value == null || typeof value == "string" ? value : value.name)),
        map(name => (name ? this._filter(name) : this.customers.slice()))
      );
      if (this.action == 'edit') {

        this.customerDetails.setValue({ name: this.customerMap.get(this.customerLoanAmountModel.customerId)?.name });

      }
    });
  }

  getCustomer(value) {
    this.selectedCustomer = value;
    this.allCustomerLoanMap.clear();
    this.customerService.getCustomerCompleteLoans(this.selectedCustomer.id, false).subscribe(data => {
      this.allCustomerLoanModels = data;
      data.forEach(customerLoan => {
        this.allCustomerLoanMap.set(customerLoan.id, customerLoan);
      });
    });

  }


  onPriceChange(event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.amountInWords = this.utils.convertToWords(amount);

    if (amount > this.pendingAmountControl.value) {
      this.customerLoansForm.get('amount').setErrors({ notSame: true });
    }
  }

  onCustomerLoanSelect(event) {
    this.customerLoansForm.get("amount").setValue(0);
    let paidAmount = this.loanTotalPaidAmountMap.get(event.value) ? this.loanTotalPaidAmountMap.get(event.value) : 0;
    if (this.customerLoanAmountModel.loanId == event.value) {
      paidAmount = paidAmount - this.customerLoanAmountModel.amount;
    }
    this.paidAmountControl.setValue(paidAmount);
    this.pendingAmountControl.setValue(this.allCustomerLoanMap.get(event.value)?.amount - paidAmount);
    this.totalAmountControl.setValue(this.allCustomerLoanMap.get(event.value)?.amount);

  }

  private _filter(name: string): CustomerModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }

  forbiddenNamesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (typeof control.value == 'string') {
        return { forbiddenNames: { value: control.value } };
      }
      return null;
    };
  }

  displayFn(user: any): string {
    return user ? user.name : '';
  }


  onSubmit() {
    const login = this.localStorageData.userValue;

    const customerLoanAmountModel: CustomerLoanAmountModel = new CustomerLoanAmountModel(this.customerLoansForm.value);
    customerLoanAmountModel.companyId = this.login.companyId;

    customerLoanAmountModel.customerId = this.selectedCustomer.id;
    customerLoanAmountModel.depositDate = formatDate(this.customerLoansForm.get("depositDate").value, settings.SAVE_DATE_FORMAT, 'en');
    customerLoanAmountModel.createdBy = login.id;
    if (this.action == 'edit') {
      customerLoanAmountModel.id = this.customerLoanAmountModel.id;
    }
    this.customerService.addNewCustomerLoanAmount(customerLoanAmountModel).pipe(first()).subscribe(data => {
      this.router.navigate(['billing/finance/customers/all-customer-loans']);
    });


  }
}
