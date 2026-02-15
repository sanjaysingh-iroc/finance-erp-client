import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { BillingService } from '../billing.service';
import { first, startWith, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SessionService } from '../../session/session.service';
import { CustomerModel } from '../../customers/customer.model';
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
  selector: 'app-add-solar-billing',
  templateUrl: './add-solar-billing.component.html',
  styleUrls: ['./add-solar-billing.component.sass']
})

export class AddSolarBillingComponent implements OnInit {

  selectedCustomer: CustomerModel = new CustomerModel({});
  customerForm: FormGroup;
  billForm: FormGroup;
  finalForm: FormGroup;
  solarBillForm: FormGroup;

  purchaseSolarProducts = new FormArray([]);

  purchaseProducts = new FormArray([]);
  brandList: BrandModel[] = [];
  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();

  productMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  productNameList: ProductBrandModel[] = [];
  // solarProductNameList: ProductBrandModel[] = [];
  // inverterProductNameList: ProductBrandModel[] = [];

  solarProductList: ProductBrandModel[][] = [];

  paymentTypeMap: Map<number, PaymentTypeModel> = new Map<number, PaymentTypeModel>();
  filteredOptions: Observable<CustomerModel[]>;
  showDateFormat: string = settings.SHOW_DATE_FORMAT;

  customerModelMap: Map<number, CustomerModel> = new Map<number, CustomerModel>();
  customers: CustomerModel[] = [];
  productCategoryModelsMap: Map<number, ProductCategoryModel> = new Map<number, ProductCategoryModel>();

  sessionYearList: SessionModel[];
  isCheque = false;
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
  previousInvoiceName: string;
  invoiceList: number[] = [];

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
        this.purchaseProducts.push(this.initSectionRow(billingProductModel.id, billingProductModel.productId, billingProductModel.quantity, billingProductModel.amountPerUnit,
          billingProductModel.totalAmount));
      });

    } else {
      this.billingModel = new BillingModel({}, { submissionDate: new Date });

      this.purchaseSolarProducts.push(this.initSectionRow(0, 0, 1, 0, 0));
      this.purchaseSolarProducts.push(this.initSectionRow(0, 0, 1, 0, 0));
      this.purchaseSolarProducts.push(this.initSectionRow(0, 0, 1, 0, 0));

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


    this.utilsService.getAllProductCategory().subscribe(data => {
      data.forEach(productCategoryModel => this.productCategoryModelsMap.set(productCategoryModel.id, productCategoryModel));

      this.utilsService.getBrandDetails().subscribe(data => {
        this.brandList = data;
        data.forEach(brand => this.brandMap.set(brand.id, brand));

        this.productService.getAllProducts().subscribe(data => {
          data.forEach(product => {
            this.productMap.set(product.id, product);

            if (product.productType == 13) {
              const gstPercentage: number = parseFloat(this.productCategoryModelsMap.get(this.productMap.get(product.id)?.productType)?.gstPercentage.toFixed(2));

              let cgstAmt: number = parseFloat(((product.price * gstPercentage) / 200).toFixed(2));
              let amt: number = parseFloat((product.price + cgstAmt + cgstAmt).toFixed(2));

              this.purchaseProducts.push(this.initSectionRow(0, product.id, 1, amt, amt));
            } else if (product.productType == 10) {
              let aa = this.solarProductList[0] ? this.solarProductList[0] : [];
              aa.push({
                id: product.id,
                name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
              });

              this.solarProductList[0] = aa;

            } else if (product.productType == 11) {
              let aa = this.solarProductList[1] ? this.solarProductList[1] : [];
              aa.push({
                id: product.id,
                name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
              });
              this.solarProductList[1] = aa;
            }else if (product.productType == 18) {
              let aa = this.solarProductList[2] ? this.solarProductList[2] : [];
              aa.push({
                id: product.id,
                name:  product.modelNo
              });
              this.solarProductList[2] = aa;
            }

            this.productNameList.push({
              id: product.id,
              name: product.modelNo
            });
          });

          this.setTotalAmount();
          this.productNameList.sort((a, b) => a.name.localeCompare(b.name));
        });
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
        this.updatePaymentTypeValidation();
      }
    });


    this.customerForm = this.fb.group({
      customerDetails: this.customerDetails,
      sessionYear: [this.session.id, [Validators.required]],
    });

    this.billForm = this.fb.group({
      purchaseSolarProducts: this.purchaseSolarProducts,
      purchaseProducts: this.purchaseProducts,
    });

    this.finalForm = this.fb.group({
      purchaseDate: [formatDate(this.billingModel.purchaseDate, settings.SAVE_DATE_FORMAT, 'en'), [Validators.required]],
      paymentMode: [this.billingModel.paymentMode, [Validators.required]],
      chequeNo: [this.billingModel.chequeNo, [Validators.required]],
      bankName: [this.billingModel.bankName, [Validators.required]],
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


    this.utilsService.getAllPaymentType().subscribe(data => {
      data.forEach(paymentType => this.paymentTypeMap.set(paymentType.id, paymentType));

      if (this.action == 'edit') {
        this.isCheque = this.paymentTypeMap.get(this.billingModel.paymentMode).isCheque;
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

  initSectionRow(id = 0, productId: number | undefined = undefined, quantity = 1, amountPerUnit = 0, totalAmount = 0) {
    return this.fb.group({
      id: new FormControl(id),
      productId: new FormControl(productId, [Validators.required]),
      quantity: new FormControl(quantity, [Validators.required, Validators.min(1)]),
      amountPerUnit: new FormControl(amountPerUnit),
      totalAmount: new FormControl(totalAmount),
    });
  }

  addNewRow() {
    this.purchaseProducts.push(this.initSectionRow());
  }

  removeNewRow(index) {
    this.purchaseProducts.removeAt(index);
  }

  onQuantityChange(purchaseProduct, event) {
    const quantity: number = parseFloat((event.target as HTMLInputElement).value);
    const amount: number = parseFloat(purchaseProduct.controls.amountPerUnit.value.toFixed(2));
    this.updateProductAmount(purchaseProduct, amount, quantity);
  }

  onProductChange(purchaseProduct) {
    const quantity: number = purchaseProduct.controls.quantity.value;
    const amount: number = parseFloat(this.productMap.get(purchaseProduct.controls.productId.value).price.toFixed(2));
    const gstPercentage: number = parseFloat(this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.controls.productId.value)?.productType)?.gstPercentage.toFixed(2));

    let cgstAmt = parseFloat(((amount * gstPercentage) / 200).toFixed(2));
    purchaseProduct.get('amountPerUnit').setValue(amount + cgstAmt + cgstAmt);
    this.updateProductAmount(purchaseProduct, amount + cgstAmt + cgstAmt, quantity);
  }

  onPriceChange(purchaseProduct, event) {
    const quantity: number = purchaseProduct.controls.quantity.value;
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.updateProductAmount(purchaseProduct, amount, quantity);
  }

  updateProductAmount(purchaseProduct, amount: number, quantity: number) {
    purchaseProduct.get('totalAmount').setValue(((amount) * quantity).toFixed(2));
    this.setTotalAmount();
  }

  onRoundOffPriceChange() {
    const totalAmount = this.finalForm.get("totalAmount").value;
    const roundOffAmount = this.finalForm.get("roundOffAmount").value;

    this.finalForm.get('totalAmountAfterroundOff').setValue((totalAmount - roundOffAmount).toFixed(2));

  }

  setTotalAmount() {
    let finalAmount: number = 0;
    let finalGstAmount: number = 0;
    let finalTotalAmount: number = 0;


    for (const purchaseProduct of this.purchaseSolarProducts.controls) {
      const amount = parseFloat(purchaseProduct.get('amountPerUnit').value);
      const totalAmount = parseFloat(purchaseProduct.get('totalAmount').value);
      const gstPercentage: number = this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.get('productId').value)?.productType) ? this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.get('productId').value)?.productType)?.gstPercentage : 0;

      finalAmount += amount;
      finalGstAmount += this.getExludedGST(totalAmount, gstPercentage);
      finalTotalAmount += totalAmount;

    }

    for (const purchaseProduct of this.purchaseProducts.controls) {
      const amount = parseFloat(purchaseProduct.get('amountPerUnit').value);
      const totalAmount = parseFloat(purchaseProduct.get('totalAmount').value);
      const gstPercentage: number = this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.get('productId').value)?.productType)?.gstPercentage;

      finalAmount += amount;
      finalGstAmount += this.getExludedGST(totalAmount, gstPercentage);
      finalTotalAmount += totalAmount;

    }

    finalAmount -= finalGstAmount;
    this.finalForm.get('roundOffAmount').setValue(0);
    this.finalForm.get('amount').setValue(finalAmount.toFixed(2));
    this.finalForm.get('gstAmount').setValue(finalGstAmount.toFixed(2));
    this.finalForm.get('totalAmount').setValue(finalTotalAmount.toFixed(2));
    this.finalForm.get('totalAmountAfterroundOff').setValue(finalTotalAmount.toFixed(2));

  }

  getExludedGST(amount: number, gstPercentage: number) {

    return parseFloat((amount - ((amount * 100) / (gstPercentage + 100))).toFixed(2));
    // return amount - ((amount * 100) / (gstPercentage + 100));
  }

  updateTotalAmount() {
    let totalAmount: number = 0;

    for (const purchaseProduct of this.purchaseProducts.controls) {
      const amount = parseFloat(purchaseProduct.get('totalAmount').value);
      totalAmount += amount;
    }
    this.finalForm.get('amount').setErrors({ notSame: true });
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
    this.updatePaymentTypeValidation();
  }

  updatePaymentTypeValidation() {
    if (this.isCheque) {
      this.finalForm.get('chequeNo').setValidators([Validators.required]);
      this.finalForm.get('bankName').setValidators([Validators.required]);
    } else {
      this.finalForm.get('chequeNo').clearValidators();
      this.finalForm.get('bankName').clearValidators();
    }
    this.finalForm.get('chequeNo').updateValueAndValidity();
    this.finalForm.get('bankName').updateValueAndValidity();
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
    billingModel.invoiceName = this.finalForm.get("invoiceName").value;
    billingModel.invoiceSerial = this.finalForm.get("invoiceSerial").value;

    // billingModel.invoiceName = invoiceName;

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

    const billingProductModels: BillingProductModel[] = [];


    for (let purchaseProduct of this.billForm.get("purchaseSolarProducts").value) {
      if (purchaseProduct.quantity > 0 && purchaseProduct.productId > 0) {
        billingProductModels.push(this.getBillingProduct(purchaseProduct));
      }
    }


    for (let purchaseProduct of this.billForm.get("purchaseProducts").value) {
      if (purchaseProduct.quantity > 0) {
        billingProductModels.push(this.getBillingProduct(purchaseProduct));
      }
    }

    billingModel.billingProductModels = billingProductModels;

    console.log(billingModel);

    this.billingService.addNewBilling(billingModel).pipe(first()).subscribe(data => {
      const params: string[] = [];
      params.push(this.selectedCustomer.name);
      params.push(billingModel.amount + "/-");
      params.push(data.id + "");

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

  onInvoiceChange(event) {
    const invoiceSerial: number = parseFloat((event.target as HTMLInputElement).value);
    if (this.invoiceList.indexOf(invoiceSerial) > -1) {
      this.finalForm.get('invoiceSerial').setValue('');

      if (this.action == 'edit') {
        this.finalForm.get('invoiceSerial').setValue(this.billingModel.invoiceSerial);
      }
    }
  }


  getBillingProduct(purchaseProduct) {
    const gstPercentage: number = this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.productId)?.productType) ? this.productCategoryModelsMap.get(this.productMap.get(purchaseProduct.productId)?.productType).gstPercentage : 0;
    const amountPerUnit = purchaseProduct.amountPerUnit;
    const gstAmount = this.getExludedGST(amountPerUnit, gstPercentage);
    const quantity = purchaseProduct.quantity;

    let amount = amountPerUnit - gstAmount;
    return {
      productId: purchaseProduct.productId,
      quantity: quantity,
      serialNo: '',
      gstPercentage: gstPercentage,

      amountPerUnit: amount,
      gstAmountPerUnit: gstAmount,
      totalAmountPerUnit: amountPerUnit,
      amount: (amountPerUnit - gstAmount) * quantity,
      gstAmount: gstAmount * quantity,
      totalAmount: purchaseProduct.totalAmount
    };
  }


}
