import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { first, map, startWith } from 'rxjs/operators';
import { CustomerService } from '../customer.service';
import { CustomerLoanModel, CustomerModel } from '../customer.model';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { SessionModel } from '../../session/session.model';
import { LocalStorageData } from '../../shared/local-storage-data';
import { formatDate } from '@angular/common';
import { settings } from '../../demo/data';
import { CompressImageService } from '../../shared/services/CompressImageService';
import { Utils } from '../../shared/util-class';
import { LoginModel } from '../../auth/login-model';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';


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
  allCustomersMap: Map<number, CustomerModel> = new Map<number, CustomerModel>();

  selectedCustomer: CustomerModel = new CustomerModel({});
  login: LoginModel;
  apiURL: string = environment.apiUrl;
  amountInWords: string[] = [];
  customerDetails = new FormControl(null, [
    Validators.required,
    this.forbiddenNamesValidator()
  ]);
  customers: CustomerModel[] = [];
  filteredOptions: Observable<CustomerModel[]>;

  constructor(private fb: FormBuilder,
    private customerService: CustomerService,
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

      this.customerDetails.setValue({ name: this.selectedCustomer.name });

    } else {
      this.customerLoanModel = new CustomerLoanModel({});
      this.customerLoanModel.customerLoanDate = formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en');
    }

    this.customerLoansForm = this.fb.group({
      customerLoanDate: [this.customerLoanModel.customerLoanDate, [Validators.required]],

      amount: [this.customerLoanModel.amount, [Validators.required, Validators.min(0)]],
      interestAmount: [this.customerLoanModel.interestAmount, [Validators.required, Validators.min(0)]],
      emiAmount: [this.customerLoanModel.emiAmount, [Validators.required, Validators.min(0)]],
      associateName: [this.customerLoanModel.associateName],
      associateMobile: [this.customerLoanModel.associateMobile],
      comment: [this.customerLoanModel.comment],
      uploadDoc: [undefined, [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]

    });

    this.customerService.getAllCustomers(this.login.companyId).subscribe(data => {
      console.log(data);
      this.customerDetails.reset(null);
      this.customers = [];
      data.forEach(customer => {
        if (customer.active) {
          this.allCustomersMap.set(customer.id, customer);
          this.customers.push(customer);
        }
      });

      this.customers.sort((a, b) => a.name.localeCompare(b.name));
      this.filteredOptions = this.customerDetails.valueChanges.pipe(
        startWith<any>({ id: 0, name: "" }),
        map(value => (value == null || typeof value == "string" ? value : value.name)),
        map(name => (name ? this._filter(name) : this.customers.slice()))
      );

      if (this.action == 'edit') {
        this.customerDetails.setValue({ name: this.selectedCustomer.name });
      }
    });


  }

  updateCustomerUrl(event) {
    event.target.src = 'assets/images/blank_image.png';
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
    return user ? user.name + ' S/O ' + user.fatherName : '';
  }

  private _filter(name: string): CustomerModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }

  getCustomer(value) {
    this.selectedCustomer = value;


    console.log(this.selectedCustomer);
    // this.billForm.get('solarPanelId').setValue(this.selectedCustomer.solarProductId);
  }

  convertAmtInWords(index: number, event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.convertAmountInWords(index, amount);
  }

  convertAmountInWords(index: number, amount: number) {
    this.amountInWords[index] = this.utils.convertToWords(amount);
  }

  onSubmit() {
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
      this.router.navigate(['finance/finance/customers/all-customer-loans']);
    });

  }
}
