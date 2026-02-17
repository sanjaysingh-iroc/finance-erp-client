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
  filteredOptions: Observable<CustomerModel[]>;
  filteredGuarantorOptions: Observable<CustomerModel[]>;

  customers: CustomerModel[] = [];

  selectedCustomer: CustomerModel = new CustomerModel({}, {}, {});

  selectedGuarantor: CustomerModel = new CustomerModel({}, {}, {});


  maxLoanAmountControl = new FormControl('0');
  customerDetails = new FormControl(null, [
    Validators.required,
    this.forbiddenNamesValidator()
  ]);

  guarntorDetails = new FormControl(null, [
    Validators.required,
    this.forbiddenNamesValidator()
  ]);

  constructor(private fb: FormBuilder,
    private customerService: CustomerService,
    private compressImage: CompressImageService,
    public utils: Utils,

    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.session = this.localStorageData.sessionValue;
    this.customerService.getAllCustomers().subscribe(data => {
      data.sort((a, b) => a.name.localeCompare(b.name));
      this.customers = data;
      data.forEach(customerModel => {
        this.allCustomersMap.set(customerModel.id, customerModel);

      });

      this.filteredOptions = this.customerDetails.valueChanges.pipe(
        startWith<any>({ id: 0, name: "" }),
        map(value => (value == null || typeof value == "string" ? value : value.name)),
        map(name => (name ? this._filter(name) : this.customers.slice()))
      );

      this.filteredGuarantorOptions = this.guarntorDetails.valueChanges.pipe(
        startWith<any>({ id: 0, name: "" }),
        map(value => (value == null || typeof value == "string" ? value : value.name)),
        map(name => (name ? this._filter(name) : this.customers.slice()))
      );

    });
    this.action = history.state.action;
    if (this.action == 'edit') {
      this.customerLoanModel = history.state.customerLoanModel;
      this.dialogTitle = 'Edit';
    } else {
      this.customerLoanModel = new CustomerLoanModel({});
      this.customerLoanModel.customerLoanDate = formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en');
    }

    this.customerLoansForm = this.fb.group({
      customerDetails: this.customerDetails,
      guarntorDetails: this.guarntorDetails,

      customerLoanDate: [this.customerLoanModel.customerLoanDate, [Validators.required]],
      amount: [this.customerLoanModel.amount, [Validators.required, Validators.min(0)]],
      interestAmount: [this.customerLoanModel.interestAmount, [Validators.required, Validators.min(0)]],
      emiAmount: [this.customerLoanModel.emiAmount, [Validators.required, Validators.min(0)]],
      comment: [this.customerLoanModel.comment],
      uploadDoc: [undefined, [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]
    });

  }

  private _filter(name: string): CustomerModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }

  displayFn(user: any): string {
    return user ? user.name : '';
  }

  forbiddenNamesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (typeof control.value == 'string') {
        return { forbiddenNames: { value: control.value } };
      }
      return null;
    };
  }

  getCustomer(value) {
    this.selectedCustomer = value;
  }

  getGuarantor(value) {
    this.selectedGuarantor = value;
  }


  onSubmit() {
    // this.spinnerButtonOptions.active = true;
    this.customerService.getMaxCustomerLoanId().subscribe(data => {
      const loanName: string = 'LOAN/' + this.session.name + '/' + this.utils.formatToThreeDigits(data + 1, 3, '0')
      this.addNewCustomerLoanModel(loanName);
    });
  }

  addNewCustomerLoanModel(loanName: string) {
    const login = this.localStorageData.userValue;

    const customerLoansModel: CustomerLoanModel = new CustomerLoanModel(this.customerLoansForm.value);
    customerLoansModel.customerId = this.selectedCustomer.id;
    customerLoansModel.guarantorId = this.selectedGuarantor.id;

    customerLoansModel.customerLoanDate = formatDate(this.customerLoansForm.get("customerLoanDate").value, settings.SAVE_DATE_FORMAT, 'en');
    customerLoansModel.createdBy = login.id;

    if (this.action == 'edit') {
      customerLoansModel.id = this.customerLoanModel.id;
      customerLoansModel.customerLoanName = this.customerLoanModel.customerLoanName;
    } else {
      customerLoansModel.customerLoanName = loanName;
    }
    if (this.customerLoansForm.value.uploadDoc) {
      let uploadImageData = new FormData();
      const file = this.customerLoansForm.value.uploadDoc.files[0];
      uploadImageData.append("file", file);
      uploadImageData.append("customerId", this.selectedCustomer.id + "");
      this.customerService.uploadCustomersImage(uploadImageData).subscribe(
        (response) => {
          customerLoansModel.uploadDoc = response.fileDownloadUri;
          this.customerService.addNewCustomerLoan(customerLoansModel).pipe(first()).subscribe(data => {
            this.router.navigate(['pages/customers/all-customer-loans']);
          });
        }
      );
    } else {
      customerLoansModel.uploadDoc = this.customerLoanModel.uploadDoc;
      this.customerService.addNewCustomerLoan(customerLoansModel).subscribe((data) => {
        this.router.navigate(['pages/customers/all-customer-loans']);
      });
    }

  }
}
