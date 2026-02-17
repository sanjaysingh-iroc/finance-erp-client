import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { first, map, startWith } from 'rxjs/operators';
import { CustomerService } from '../customer.service';
import { CustomerLoanAmountModel, CustomerLoanModel, CustomerModel } from '../customer.model';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { LocalStorageData } from '../../shared/local-storage-data';
import { formatDate } from '@angular/common';
import { settings } from '../../demo/data';
import { Observable } from 'rxjs';
import { CompressImageService } from '../../shared/services/CompressImageService';


@Component({
  selector: 'app-add-customer-amount',
  templateUrl: './add-customer-amount.component.html',
  styleUrls: ['./add-customer-amount.component.css']
})
export class AddCustomerAmountComponent implements OnInit {

  spinnerButtonOptions: MatProgressButtonOptions;
  customerMap: Map<number, CustomerModel> = new Map<number, CustomerModel>();

  allCustomerLoanModels: CustomerLoanModel[];
  loanAmountMap: Map<number, CustomerLoanAmountModel> = new Map<number, CustomerLoanAmountModel>();

  customerLoanForm: FormGroup;
  customerLoanFormArray = new FormArray([]);

  depositDate = new FormControl('');

  constructor(private fb: FormBuilder,
    private customerService: CustomerService,
    private commonLayout: CommonLayout,
    private localStorageData: LocalStorageData,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.depositDate.setValue(new Date);
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.customerLoanFormArray.clear();

    this.customerService.getAllCustomerLoanAmountByDate(formatDate(this.depositDate.value, settings.SAVE_DATE_FORMAT, 'en')).pipe(first()).subscribe(data => {
      data.forEach(customer => {
        this.loanAmountMap.set(customer.loanId, customer);
      });

      this.customerService.getAllCustomers().subscribe(data => {
        data.forEach(customer => {
          this.customerMap.set(customer.id, customer);
        });

        this.customerService.getAllCompleteCustomerLoans(false).subscribe(data => {
          this.allCustomerLoanModels = data;
          data.forEach(customerLoan => {

            const amount = this.loanAmountMap.get(customerLoan.id) ? this.loanAmountMap.get(customerLoan.id)?.amount : 0;
            const id = this.loanAmountMap.get(customerLoan.id) ? this.loanAmountMap.get(customerLoan.id)?.id : undefined;
            const isApprove = this.loanAmountMap.get(customerLoan.id) ? this.loanAmountMap.get(customerLoan.id)?.approved : false;
            this.customerLoanFormArray.push(this.initSectionRow(id, customerLoan.id, customerLoan.customerId, customerLoan.customerLoanName, this.customerMap.get(customerLoan.customerId)?.name, this.customerMap.get(customerLoan.customerId)?.spouseName, amount, isApprove));
          });
        });
      });

    });
    this.customerLoanForm = this.fb.group({
      customerLoans: this.customerLoanFormArray,
    });

  }

  initSectionRow(id, loanId, customerId, loanName, name, spouseName, amount, isApprove) {
    return this.fb.group({
      id: new FormControl(id),
      loanId: new FormControl(loanId),
      loanName: [loanName],
      customerId: new FormControl(customerId),
      name: [name],
      spouseName: [spouseName],
      amount: [amount],
      isApprove: [isApprove]
    });
  }

  onDateChange() {
    this.customerService.getAllCustomerLoanAmountByDate(formatDate(this.depositDate.value, settings.SAVE_DATE_FORMAT, 'en')).pipe(first()).subscribe(data => {
      this.loanAmountMap.clear();
      data.forEach(customer => {
        this.loanAmountMap.set(customer.loanId, customer);
      });

      this.customerLoanFormArray.clear();
      this.allCustomerLoanModels.forEach(customerLoan => {
        const amount = this.loanAmountMap.get(customerLoan.id) ? this.loanAmountMap.get(customerLoan.id)?.amount : 0;
        const id = this.loanAmountMap.get(customerLoan.id) ? this.loanAmountMap.get(customerLoan.id)?.id : undefined;
        const isApprove = this.loanAmountMap.get(customerLoan.id) ? this.loanAmountMap.get(customerLoan.id)?.approved : false;

        this.customerLoanFormArray.push(this.initSectionRow(id, customerLoan.id, customerLoan.customerId, customerLoan.customerLoanName, this.customerMap.get(customerLoan.customerId)?.name, this.customerMap.get(customerLoan.customerId)?.spouseName, amount, isApprove));
      });
    });
  }

  onSubmit() {
    const login = this.localStorageData.userValue;

    const customerLoanRolls: CustomerLoanAmountModel[] = [];
    for (const customerLoan of this.customerLoanForm.value.customerLoans) {

      if (customerLoan.amount > 0) {
        const customerLoanAmountModel: CustomerLoanAmountModel = new CustomerLoanAmountModel({});

        customerLoanAmountModel.id = customerLoan.id;
        customerLoanAmountModel.loanId = customerLoan.loanId;
        customerLoanAmountModel.customerId = customerLoan.customerId;
        customerLoanAmountModel.depositDate = formatDate(this.depositDate.value, settings.SAVE_DATE_FORMAT, 'en');
        customerLoanAmountModel.createdBy = login.id;
        customerLoanAmountModel.amount = customerLoan.amount;
        customerLoanRolls.push(customerLoanAmountModel);
      }
    }

    this.customerService.addNewCustomerLoanAmounts(customerLoanRolls).pipe(first()).subscribe(data => {
      this.router.navigate(['pages/customers/all-customer-loans']);
    });


  }
}
