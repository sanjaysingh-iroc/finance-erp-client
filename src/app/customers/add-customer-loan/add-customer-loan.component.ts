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
import { forkJoin, Observable, of } from 'rxjs';
import { AssociateModel } from '../../associate/associate.model';
import { AssociateService } from '../../associate/associate.service';
import { UtilsService } from '../../shared/services/utils.service';
import { GroupModel, PaymentFrequencyModel } from '../../shared/common.models';


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


  selectedAssociate: AssociateModel = new AssociateModel({});

  associateDetails = new FormControl(null, [
    Validators.required,
    this.associateForbiddenNamesValidator()
  ]);
  associates: AssociateModel[] = [];
  associateFilteredOptions: Observable<AssociateModel[]>;


  minDate: Date;
  maxDate: Date;

  paymentFrequencyModels: PaymentFrequencyModel[] = [];
  groupModels: GroupModel[] = [];

  constructor(private fb: FormBuilder,
    private customerService: CustomerService,
    private associateService: AssociateService,
    private compressImage: CompressImageService,
    public utils: Utils,
    private utilsService: UtilsService,

    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.session = this.localStorageData.sessionValue;

    this.maxDate = new Date();
    this.minDate = new Date(this.session.fromDate);

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.selectedCustomer = history.state.customer;
      this.customerLoanModel = history.state.customerLoanModel;
      this.dialogTitle = 'Edit';
    } else {
      this.customerLoanModel = new CustomerLoanModel({});
      this.customerLoanModel.loanDate = formatDate(new Date, settings.SAVE_DATE_FORMAT, 'en');
    }

    this.utilsService.getAllPaymentFrequency().subscribe(data => {
      this.paymentFrequencyModels = data;

    });

    this.utilsService.getAllGroupDetails().subscribe(data => {
      this.groupModels = data;

    });

    this.customerLoansForm = this.fb.group({
      customerDetails: this.customerDetails,
      loanDate: [this.customerLoanModel.loanDate],

      groupId: [this.customerLoanModel.groupId, [Validators.required]],
      paymentType: [this.customerLoanModel.paymentType, [Validators.required]],

      lendedAmount: [this.customerLoanModel.lendedAmount, [Validators.required]],
      refundableAmount: [this.customerLoanModel.refundableAmount, [Validators.required]],
      fileChargeAmount: [this.customerLoanModel.fileChargeAmount, [Validators.required]],
      installmentAmount: [this.customerLoanModel.installmentAmount, [Validators.required]],
      duration: [this.customerLoanModel.duration, [Validators.required]],
      associateDetails: this.associateDetails,
      comment: [this.customerLoanModel.comment],
      uploadDoc: [undefined, [this.compressImage.fileMaxSize(2 * 1024 * 1024)]]

    });

    this.customerService.getAllCustomers(this.login.companyId).subscribe(data => {
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
        this.customerDetails.setValue(this.selectedCustomer);
      }
    });

    this.associateService.getAllActiveAssociates(this.login.companyId).subscribe(data => {
      this.associateDetails.reset(null);

      this.associates = [];
      data.forEach(customer => {
        if (customer.active) {
          this.associates.push(customer);
          if (this.action == 'edit' && customer.id == this.customerLoanModel.associateId) {
            this.selectedAssociate = customer;
            this.associateDetails.setValue(this.selectedAssociate);
          }
        }
      });

      this.associates.sort((a, b) => a.name.localeCompare(b.name));
      this.associateFilteredOptions = this.associateDetails.valueChanges.pipe(
        startWith<any>({ id: 0, name: "" }),
        map(value => (value == null || typeof value == "string" ? value : value.name)),
        map(name => (name ? this.associate_filter(name) : this.associates.slice()))
      );

      // if (this.action == 'edit') {
      //   this.associateDetails.setValue(this.selectedAssociate);
      // }
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

  associateForbiddenNamesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (typeof control.value == 'string') {
        return { forbiddenNames: { value: control.value } };
      }
      return null;
    };
  }

  associateDisplayFn(user: any): string {
    return user ? user.name + ' S/O ' + user.fatherName : '';
  }

  private associate_filter(name: string): AssociateModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }

  getCustomer(value) {
    this.selectedCustomer = value;
  }

  getAssociate(value) {
    this.selectedAssociate = value;
  }

  convertAmtInWords(index: number, event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.convertAmountInWords(index, amount);
  }

  convertAmountInWords(index: number, amount: number) {
    this.amountInWords[index] = this.utils.convertToWords(amount);
  }

  onSubmit() {
    this.addNewCustomerLoanModel();
  }

  addNewCustomerLoanModel() {
    const login = this.localStorageData.userValue;

    const customerLoansModel: CustomerLoanModel = new CustomerLoanModel(this.customerLoansForm.value);
    customerLoansModel.companyId = this.login.companyId;

    customerLoansModel.customerId = this.selectedCustomer.id;
    customerLoansModel.associateId = this.selectedAssociate.id;
    // customerLoansModel.paymentType = this.selectedCustomer.id;

    customerLoansModel.loanDate = formatDate(this.customerLoansForm.get("loanDate").value, settings.SAVE_DATE_FORMAT, 'en');
    customerLoansModel.createdBy = login.id;

    if (this.action == 'edit') {
      customerLoansModel.id = this.customerLoanModel.id;
    }


    this.customerService.addNewCustomerLoan(customerLoansModel).subscribe((data) => {

      this.uploadAllDoc(data);
    });

  }

  uploadAllDoc(customerLoanModel: CustomerLoanModel) {
    const apiCalls = {
      uploadDoc: this.uploadDoc(customerLoanModel.id, this.customerLoansForm.value.uploadDoc)
    };

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        customerLoanModel.uploadDoc = (results as any).uploadDoc.fileDownloadUri ? (results as any).uploadDoc.fileDownloadUri : this.customerLoanModel.uploadDoc;

        this.customerService.addNewCustomerLoan(customerLoanModel).subscribe((customerData) => {
          this.router.navigate(['finance/customers/all-customer-loans']);
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
      uploadImageData.append("location", "customer");
      return this.utilsService.uploadFile(uploadImageData);
    } else {
      return of({});;
    }
  }
}
