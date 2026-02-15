import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { BillingService } from '../billing.service';
import { first, startWith, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SessionService } from '../../session/session.service';
import { CustomerLoanModel, CustomerModel } from '../../customers/customer.model';
import { Observable } from 'rxjs';
import { monthMap, settings } from '../../demo/data';
import { CustomerService } from '../../customers/customer.service';
import { formatDate } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../billing/confirm-dialog/confirm-dialog.component';
import { BrandModel, FullName, PaymentTypeModel, ProductBrandModel, ProductCategoryModel, SettingModel } from '../../shared/common.models';
import { SessionModel } from '../../session/session.model';
import { LocalStorageData } from '../../shared/local-storage-data';
import { CommonLayout } from '../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { BillingProductModel, BillingModel } from '../billing.model';
import { UtilsService } from '../../shared/services/utils.service';
import { MatOption } from '@angular/material/core';
import { ProductModel } from '../../products/product.model';
import { ProductService } from '../../products/product.service';
import { CompanyModel } from '../../company-settings/company.model';
import { CompanyService } from '../../company-settings/company.service';
import { Utils } from '../../shared/util-class';
const _ = require('lodash');

@Component({
  selector: 'app-add-billing',
  templateUrl: './add-billing.component.html',
  styleUrls: ['./add-billing.component.sass']
})

export class AddBillingComponent implements OnInit {

  selectedCustomer: CustomerModel = new CustomerModel({});
  customerForm: FormGroup;
  billForm: FormGroup;
  finalForm: FormGroup;
  purchaseProducts = new FormArray([]);
  brandList: BrandModel[] = [];
  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();

  productMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  productNameList: ProductBrandModel[] = [];

  paymentTypeMap: Map<number, PaymentTypeModel> = new Map<number, PaymentTypeModel>();
  filteredOptions: Observable<CustomerModel[]>;
  showDateFormat: string = settings.SHOW_DATE_FORMAT;

  customerModelMap: Map<number, CustomerModel> = new Map<number, CustomerModel>();
  customers: CustomerModel[] = [];
  productCategoryModelsMap: Map<number, ProductCategoryModel> = new Map<number, ProductCategoryModel>();

  sessionYearList: SessionModel[];
  isCheque = false;
  isLoan = false;

  session: SessionModel;
  spinnerButtonOptions: MatProgressButtonOptions;

  currency = settings.CURRENCY;
  settingModels: SettingModel[] = [];

  customerDetails = new FormControl(null, [
    Validators.required,
    this.forbiddenNamesValidator()
  ]);
  company: CompanyModel;
  action: string;
  billingModel: BillingModel;
  dialogTitle: string = 'Add';
  // invoiceName: string;
  previousInvoiceName: string;

  invoiceList: number[] = [];
  customerLoanModel: CustomerLoanModel = new CustomerLoanModel({});

  constructor(
    private fb: FormBuilder,
    private billingService: BillingService,
    private customerService: CustomerService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private productService: ProductService,
    private companyService: CompanyService,
    private utils: Utils,

    private localStorageData: LocalStorageData,
    private dialog: MatDialog,
    private router: Router,
    private commonLayout: CommonLayout,
  ) { }

  ngOnInit(): void {

    this.action = history.state.action;
    if (this.action == 'edit') {
      this.billingModel = history.state.billingModel;
      this.dialogTitle = 'Edit';
      this.billingModel.billingProductModels.forEach(billingProductModel => {
        this.purchaseProducts.push(this.initSectionRow(billingProductModel.id, billingProductModel.productId, billingProductModel.quantity, billingProductModel.serialNo, billingProductModel.amountPerUnit, billingProductModel.gstAmountPerUnit,
          billingProductModel.totalAmountPerUnit, billingProductModel.amount, billingProductModel.gstAmount, billingProductModel.totalAmount, billingProductModel.gstPercentage));
      });

    } else {
      this.billingModel = new BillingModel({}, { submissionDate: new Date });
      this.purchaseProducts.push(this.initSectionRow());
    }


    this.billingService.getAllBillings().subscribe(data => {
      data.forEach(billingModel => {
        this.invoiceList.push(billingModel.invoiceSerial);
      });
      if (this.action == 'edit') {
        const index = this.invoiceList.indexOf(this.billingModel.invoiceSerial);
        if (index > -1) { // only splice if item is found
          this.invoiceList.splice(index, 1);
        }
      }
    });


    this.utilsService.getAllProductCategory().subscribe(data => {
      data.forEach(productCategoryModel => this.productCategoryModelsMap.set(productCategoryModel.id, productCategoryModel));
    });

    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.session = this.localStorageData.sessionValue;
    this.settingModels = this.localStorageData.settingValues;

    this.sessionService.getAllAroundSessionYears().subscribe(data => {
      this.sessionYearList = data;
    });


    this.utilsService.getBrandDetails().subscribe(data => {
      this.brandList = data;
      data.forEach(brand => this.brandMap.set(brand.id, brand));

      this.productService.getAllProducts().subscribe(data => {
        data.forEach(product => {
          this.productMap.set(product.id, product);
          this.productNameList.push({
            id: product.id,
            name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
          });
        });
        this.productNameList.sort((a, b) => a.name.localeCompare(b.name));
      });
    });

    this.customerService.getAllCustomers().subscribe(data => {
      this.customerDetails.reset(null);
      this.customers = [];
      data.forEach(customer => {
        if (customer.active) {
          this.customerModelMap.set(customer.id, customer);
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
        this.selectedCustomer = this.customerModelMap.get(this.billingModel.customerId);

        this.customerDetails.setValue({ name: this.customerModelMap.get(this.billingModel.customerId)?.name });

        this.isCheque = this.paymentTypeMap.get(this.billingModel.paymentMode).isCheque;
        this.isLoan = this.paymentTypeMap.get(this.billingModel.paymentMode).isLoan;

        this.updatePaymentTypeValidation();
      }
    });

    this.customerForm = this.fb.group({
      customerDetails: this.customerDetails,
      sessionYear: [this.session.id, [Validators.required]],
    });

    this.billForm = this.fb.group({
      purchaseProducts: this.purchaseProducts,
    });

    this.finalForm = this.fb.group({
      purchaseDate: [formatDate(this.billingModel.purchaseDate, settings.SAVE_DATE_FORMAT, 'en'), [Validators.required]],
      paymentMode: [this.billingModel.paymentMode, [Validators.required]],
      chequeNo: [this.billingModel.chequeNo, [Validators.required]],
      bankName: [this.billingModel.bankName, [Validators.required]],

      loanAmount: [this.billingModel.chequeNo, [Validators.required]],
      interestAmount: [this.billingModel.chequeNo, [Validators.required]],
      emiAmount: [this.billingModel.bankName, [Validators.required]],

      amount: [this.billingModel.amount, [Validators.required, Validators.min(0)]],
      gstAmount: [this.billingModel.gstAmount, [Validators.required, Validators.min(0)]],
      roundOffAmount: [this.billingModel.roundOffAmount],
      totalAmount: [this.billingModel.totalAmount, [Validators.required, Validators.min(0)]],
      totalAmountAfterroundOff: [this.billingModel.totalAmount - this.billingModel.roundOffAmount],
      invoiceName: [this.billingModel.invoiceName, [Validators.required]],
      invoiceSerial: [this.billingModel.invoiceSerial, [Validators.required]],

      details: [this.billingModel.details],
    });

    this.companyService.getCompanyDetails().pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }
      this.company = companyModel;
      this.billingService.getMaxId(this.session.id).subscribe(data => {

        if (this.action != 'edit') {
          this.finalForm.get('invoiceName').setValue(this.company.companyCode + '/' + this.session.name + '/');
          const invoiceSerial = data ? data.invoiceSerial : 0;
          this.finalForm.get('invoiceSerial').setValue(invoiceSerial + 1);
          if (data) {
            this.previousInvoiceName = data.invoiceName + this.utils.formatToThreeDigits(invoiceSerial, 3, '0');
          }
        }
      });
    });


    if (this.action == 'edit') {
      this.customerService.getCustomerLoansByInvoice(this.billingModel.id).subscribe(data => {
        this.customerLoanModel = data;
        console.log(data);

        this.finalForm.get('loanAmount').setValue(data.amount);
        this.finalForm.get('emiAmount').setValue(data.emiAmount);
      });

    }


    this.utilsService.getAllPaymentType().subscribe(data => {
      data.forEach(paymentType => this.paymentTypeMap.set(paymentType.id, paymentType));

      if (this.action == 'edit') {
        this.isCheque = this.paymentTypeMap.get(this.billingModel.paymentMode).isCheque;
        this.isLoan = this.paymentTypeMap.get(this.billingModel.paymentMode).isLoan;

        this.updatePaymentTypeValidation();
      }
    });
  }
  private _filter(name: string): CustomerModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }

  getCustomer(value) {
    this.selectedCustomer = value;
  }

  initSectionRow(id = 0, productId = undefined, quantity = 1, serialNo = '', amountPerUnit = 0, gstAmountPerUnit = 0, totalAmountPerUnit = 0, amount = 0, gstAmount = 0, totalAmount = 0, gstPercentage = 0) {
    return this.fb.group({
      id: new FormControl(id),
      productId: new FormControl(productId, [Validators.required]),
      quantity: new FormControl(quantity, [Validators.required, Validators.min(1)]),
      serialNo: new FormControl(serialNo),
      gstPercentage: new FormControl(gstPercentage),

      amountPerUnit: new FormControl(amountPerUnit),
      gstAmountPerUnit: new FormControl(gstAmountPerUnit),
      totalAmountPerUnit: new FormControl(totalAmountPerUnit),
      amount: new FormControl(amount),
      gstAmount: new FormControl(gstAmount),
      totalAmount: new FormControl(totalAmount),

    });
  }

  addNewRow() {
    this.purchaseProducts.push(this.initSectionRow());
  }

  removeNewRow(index) {
    this.purchaseProducts.removeAt(index);
    this.setTotalAmount();
  }

  onInvoiceChange(event) {
    const invoiceSerial: number = parseFloat((event.target as HTMLInputElement).value);
    if (this.invoiceList.indexOf(invoiceSerial) > -1) {
      this.finalForm.get('invoiceSerial').setValue('');

      if (this.action == 'edit') {
        this.finalForm.get('invoiceSerial').setValue(this.billingModel.invoiceSerial);
      }
    }
  }

  onQuantityChange(purchaseProduct, event) {
    const quantity: number = parseFloat((event.target as HTMLInputElement).value);
    const amount: number = parseFloat(purchaseProduct.controls.amountPerUnit.value.toFixed(2));
    // const gstPercentage: number = parseFloat(this.productMap.get(purchaseProduct.controls.productId.value).gstPercentage.toFixed(2));
    const gstPercentage: number = parseFloat(this.productCategoryModelsMap?.get(this.productMap?.get(purchaseProduct.controls.productId.value)?.productType)?.gstPercentage.toFixed(2));

    let cgstAmt = parseFloat(((amount * gstPercentage) / 200).toFixed(2));
    let sgstAmt = cgstAmt;
    this.updateProductAmount(purchaseProduct, amount, cgstAmt + sgstAmt, quantity);
    this.setTotalAmount();
  }

  onProductChange(purchaseProduct) {
    const quantity: number = purchaseProduct.controls.quantity.value;

    const amount: number = parseFloat(this.productMap.get(purchaseProduct.controls.productId.value).price.toFixed(2));
    // const gstPercentage: number = this.productMap.get(purchaseProduct.controls.productId.value).gstPercentage;
    const gstPercentage: number = parseFloat(this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.controls.productId.value)?.productType)?.gstPercentage.toFixed(2));

    let cgstAmt = parseFloat(((amount * gstPercentage) / 200).toFixed(2));
    let sgstAmt = cgstAmt;
    purchaseProduct.get('gstPercentage').setValue(gstPercentage);
    purchaseProduct.get('amountPerUnit').setValue(amount);
    purchaseProduct.get('gstAmountPerUnit').setValue(cgstAmt + sgstAmt);
    purchaseProduct.get('totalAmountPerUnit').setValue(cgstAmt + sgstAmt + amount);

    this.updateProductAmount(purchaseProduct, amount, cgstAmt + sgstAmt, quantity);
    this.setTotalAmount();
  }

  onPriceChange(purchaseProduct, event) {
    const quantity: number = purchaseProduct.controls.quantity.value;

    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    // const gstPercentage: number = this.productMap.get(purchaseProduct.controls.productId.value).gstPercentage;
    const gstPercentage: number = this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.controls.productId.value)?.productType)?.gstPercentage;

    let cgstAmt = parseFloat(((amount * gstPercentage) / 200).toFixed(2));
    let sgstAmt = cgstAmt;

    purchaseProduct.get('gstAmountPerUnit').setValue(cgstAmt + sgstAmt);
    purchaseProduct.get('totalAmountPerUnit').setValue(cgstAmt + sgstAmt + amount);

    this.updateProductAmount(purchaseProduct, amount, cgstAmt + sgstAmt, quantity);
    this.setTotalAmount();
  }

  onTotalPriceChange(purchaseProduct, event) {
    // Remove GST: GST Amount = Original Cost – (Original Cost * (100 / (100 + GST% ) ) )
    const quantity: number = purchaseProduct.controls.quantity.value;

    const totalAmount: number = parseFloat((event.target as HTMLInputElement).value);
    const gstPercentage: number = this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.controls.productId.value)?.productType)?.gstPercentage;

    let cgstAmt: number = parseFloat(((totalAmount - (totalAmount * (100 / (100 + gstPercentage)))) / 2).toFixed(2));
    let amount: number = parseFloat((totalAmount - (cgstAmt + cgstAmt)).toFixed(2));

    purchaseProduct.get('amountPerUnit').setValue(amount);
    purchaseProduct.get('gstAmountPerUnit').setValue(cgstAmt + cgstAmt);

    this.updateProductAmount(purchaseProduct, amount, cgstAmt + cgstAmt, quantity);
    this.setTotalAmount();
  }

  updateProductAmount(purchaseProduct, amount: number, gstAmt: number, quantity: number) {

    purchaseProduct.get('amount').setValue((amount * quantity).toFixed(2));
    purchaseProduct.get('gstAmount').setValue((gstAmt * quantity).toFixed(2));
    purchaseProduct.get('totalAmount').setValue(((gstAmt + amount) * quantity).toFixed(2));
  }

  onRoundOffPriceChange() {
    const totalAmount = this.finalForm.get("totalAmount").value;
    const roundOffAmount = this.finalForm.get("roundOffAmount").value;

    this.finalForm.get('totalAmountAfterroundOff').setValue((totalAmount - roundOffAmount).toFixed(2));

  }

  getExludedGST(amount: number, gstPercentage: number) {
    return (amount * 100) / (gstPercentage + 100);
  }

  setTotalAmount() {
    let finalAmount: number = 0;
    let finalGstAmount: number = 0;
    let finalTotalAmount: number = 0;

    for (const purchaseProduct of this.purchaseProducts.controls) {
      const amount = parseFloat(purchaseProduct.get('amount').value);
      const gstAmount = parseFloat(purchaseProduct.get('gstAmount').value);
      const totalAmount = parseFloat(purchaseProduct.get('totalAmount').value);

      finalAmount += amount;
      finalGstAmount += gstAmount;
      finalTotalAmount += totalAmount;

    }
    this.finalForm.get('roundOffAmount').setValue(0);
    this.finalForm.get('amount').setValue(finalAmount.toFixed(2));
    this.finalForm.get('gstAmount').setValue(finalGstAmount.toFixed(2));
    this.finalForm.get('totalAmount').setValue(finalTotalAmount.toFixed(2));
    this.finalForm.get('totalAmountAfterroundOff').setValue(finalTotalAmount.toFixed(2));

  }


  isAmountValid() {
    let finalAmount = this.finalForm.get("amount").value;
    if (finalAmount == null) {
      finalAmount = 0;
      this.finalForm.get('amount').setValue(0);
    }

    if (finalAmount == 0 && finalAmount == 0) {
      return true;
    }
    return false;

  }

  onPaymentTypeChange(event) {
    this.isCheque = this.paymentTypeMap.get(event.value).isCheque;
    this.isLoan = this.paymentTypeMap.get(event.value).isLoan;
    console.log(event.value);
    console.log(this.paymentTypeMap);
    console.log(this.isCheque);
    this.updatePaymentTypeValidation();
  }

  updatePaymentTypeValidation() {
    if (this.isCheque) {
      this.finalForm.get('loanAmount').clearValidators();
      this.finalForm.get('interestAmount').clearValidators();

      this.finalForm.get('emiAmount').clearValidators();

      this.finalForm.get('chequeNo').setValidators([Validators.required]);
      this.finalForm.get('bankName').setValidators([Validators.required]);
    } else if (this.isLoan) {
      this.finalForm.get('chequeNo').clearValidators();
      this.finalForm.get('bankName').clearValidators();

      this.finalForm.get('loanAmount').setValidators([Validators.required]);
      this.finalForm.get('interestAmount').setValidators([Validators.required]);
      this.finalForm.get('emiAmount').setValidators([Validators.required]);
    } else {
      this.finalForm.get('chequeNo').clearValidators();
      this.finalForm.get('bankName').clearValidators();

      this.finalForm.get('loanAmount').clearValidators();
      this.finalForm.get('interestAmount').clearValidators();
      this.finalForm.get('emiAmount').clearValidators();

    }
    this.finalForm.get('chequeNo').updateValueAndValidity();
    this.finalForm.get('bankName').updateValueAndValidity();

    this.finalForm.get('loanAmount').updateValueAndValidity();
    this.finalForm.get('interestAmount').updateValueAndValidity();
    this.finalForm.get('emiAmount').updateValueAndValidity();
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
    // this.spinnerButtonOptions.active = true;

    // this.billingService.getMaxId(this.session.id).subscribe(data => {
    // const invoiceName: string = this.company.companyCode + '/' + this.session.name + '/' + this.utils.formatToThreeDigits(data + 1, 3, '0')
    this.addNewBillingModel();
    // });
  }

  addNewBillingModel() {
    const login = this.localStorageData.userValue;
    const billingModel = new BillingModel({}, {});
    billingModel.customerId = this.selectedCustomer.id;
    if (this.action == 'edit') {
      billingModel.id = this.billingModel.id;
    }

    billingModel.sessionYear = this.customerForm.get("sessionYear").value;
    // billingModel.invoiceName = invoiceName;
    billingModel.invoiceName = this.finalForm.get("invoiceName").value;
    billingModel.invoiceSerial = this.finalForm.get("invoiceSerial").value;

    billingModel.amount = this.finalForm.get("amount").value;
    billingModel.gstAmount = this.finalForm.get("gstAmount").value;
    billingModel.totalAmount = this.finalForm.get("totalAmount").value;
    billingModel.roundOffAmount = this.finalForm.get("roundOffAmount").value;

    billingModel.purchaseDate = formatDate(this.finalForm.get("purchaseDate").value, settings.SAVE_DATE_FORMAT, 'en');
    billingModel.paymentMode = this.finalForm.get("paymentMode").value;
    billingModel.chequeNo = this.finalForm.get("chequeNo").value;
    billingModel.bankName = this.finalForm.get("bankName").value;
    billingModel.details = this.finalForm.get("details").value;
    billingModel.createdBy = login.id;

    const customerIds: number[] = [];
    customerIds.push(billingModel.customerId);


    let finalAmount = this.finalForm.get("amount").value;

    const billingProductModels: BillingProductModel[] = [];

    for (let purchaseProduct of this.billForm.get("purchaseProducts").value) {

      let amount = purchaseProduct.amount;
      finalAmount -= amount;
      billingProductModels.push({
        productId: purchaseProduct.productId,
        quantity: purchaseProduct.quantity,
        serialNo: purchaseProduct.serialNo,
        gstPercentage: purchaseProduct.gstPercentage,

        amountPerUnit: purchaseProduct.amountPerUnit,
        gstAmountPerUnit: purchaseProduct.gstAmountPerUnit,
        totalAmountPerUnit: purchaseProduct.totalAmountPerUnit,
        amount: amount,
        gstAmount: purchaseProduct.gstAmount,
        totalAmount: purchaseProduct.totalAmount
      });
    }

    billingModel.billingProductModels = billingProductModels;

    this.billingService.addNewBilling(billingModel).pipe(first()).subscribe(data => {

      if (this.isLoan) {
        this.addLoan(data);
      }

      let row = { title: "Do you want to print?", buttonCaption: 'Print' };
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: row,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result == 1) {
          this.router.navigateByUrl('pages/billings/billing-receipt', { state: { billingModel: data, action: 'view' } });
        } else {
          this.router.navigate(['pages/billings/all-billings']);
        }
      });
    });

  }



  addLoan(billingModel: BillingModel) {
    // this.spinnerButtonOptions.active = true;
    this.customerService.getMaxCustomerLoanId().subscribe(data => {
      const loanName: string = 'LOAN/' + this.session.name + '/' + this.utils.formatToThreeDigits(data + 1, 3, '0')
      this.addNewCustomerLoanModel(loanName, billingModel);
    });
  }

  addNewCustomerLoanModel(loanName: string, billingModel: BillingModel) {
    const login = this.localStorageData.userValue;

    const customerLoansModel: CustomerLoanModel = new CustomerLoanModel({});

    customerLoansModel.invoiceId = billingModel.id;
    customerLoansModel.customerLoanDate = billingModel.purchaseDate;
    customerLoansModel.amount = this.finalForm.get("loanAmount").value;
    customerLoansModel.interestAmount = this.finalForm.get("interestAmount").value;
    customerLoansModel.emiAmount = this.finalForm.get("emiAmount").value;

    customerLoansModel.customerLoanName = loanName;
    // customerLoansModel.comment = formData.comment || '';


    customerLoansModel.customerId = this.selectedCustomer.id;
    customerLoansModel.createdBy = login.id;

    if (this.action == 'edit') {
      customerLoansModel.id = this.customerLoanModel.id;
      customerLoansModel.customerLoanName = this.customerLoanModel.customerLoanName;
    }

    console.log(customerLoansModel);
    this.customerService.addNewCustomerLoan(customerLoansModel).subscribe(
      (data) => {
        // this.router.navigate(['pages/customers/all-customer-loans']);
      });

  }


}
