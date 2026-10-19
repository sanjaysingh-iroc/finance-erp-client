import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { first, startWith, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SessionService } from '../../../session/session.service';
import { Observable } from 'rxjs';
import { settings } from '../../../demo/data';
import { formatDate } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BrandModel, PaymentTypeModel, ProductBrandModel, ProductCategoryModel, SerialKeyModel, SettingModel } from '../../../shared/common.models';
import { SessionModel } from '../../../session/session.model';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductModel } from '../../products/product.model';
import { ProductService } from '../../products/product.service';
import { CompanyModel } from '../../../company-settings/company.model';
import { CompanyService } from '../../../company-settings/company.service';
import { Utils } from '../../../shared/util-class';
import { LoginModel } from '../../../auth/login-model';
import { SolarBillingModel, SolarBillingProductModel, SolarCustomerModel } from '../solar-billing.model';
import { SolarService } from '../solar.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
const _ = require('lodash');

@Component({
  selector: 'app-add-solar-billing',
  templateUrl: './add-solar-billing.component.html',
  styleUrls: ['./add-solar-billing.component.sass']
})

export class AddSolarBillingComponent implements OnInit {

  selectedCustomer: SolarCustomerModel = new SolarCustomerModel({}, {});
  customerForm: FormGroup;
  billForm: FormGroup;
  finalForm: FormGroup;
  brandMap: Map<number, BrandModel> = new Map<number, BrandModel>();
  productMap: Map<number, ProductModel> = new Map<number, ProductModel>();

  paymentTypeMap: Map<number, PaymentTypeModel> = new Map<number, PaymentTypeModel>();
  filteredOptions: Observable<SolarCustomerModel[]>;
  showDateFormat: string = settings.SHOW_DATE_FORMAT;

  solarCustomerModelMap: Map<number, SolarCustomerModel> = new Map<number, SolarCustomerModel>();
  customers: SolarCustomerModel[] = [];
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
  billingModel: SolarBillingModel;
  dialogTitle: string = 'Add';
  previousInvoiceName: string;

  invoiceList: number[] = [];
  login: LoginModel;

  solarSystemGst: number;


  solarProductList: ProductBrandModel[] = [];
  solarProductMap: Map<number, string> = new Map<number, string>();

  inverterProductList: ProductBrandModel[] = [];
  inverterProductMap: Map<number, string> = new Map<number, string>();

  batteryProductList: ProductBrandModel[] = [];
  batteryProductMap: Map<number, string> = new Map<number, string>();

  solarSystemList: ProductModel[] = [];
  // installationList: ProductModel[] = [];

  // installationProduct: ProductModel;
  // solarSystemProduct: ProductModel;
  serialKeyModel: SerialKeyModel;

  constructor(
    private fb: FormBuilder,
    private billingService: SolarService,
    private solarBillingService: SolarService,
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
    this.login = this.localStorageData.userValue;
    this.action = history.state.action;
    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.session = this.localStorageData.sessionValue;
    this.settingModels = this.localStorageData.settingValues;

    let panelSerial = '';
    let batterySerial = '';
    if (this.action == 'edit') {

      this.billingModel = history.state.billingModel;
      this.selectedCustomer = history.state.customer;
      this.customerDetails.setValue({ name: this.selectedCustomer.name });

      this.solarSystemGst = this.billingModel.solarBillingProductModels[0].gstPercentage;

      this.selectedCustomer.solarPanelModels.forEach(solarPanelModel => {
        panelSerial += solarPanelModel.panelSerial + ',';
      });
      this.selectedCustomer.solarBatteryModels.forEach(solarPanelModel => {
        batterySerial += solarPanelModel.serialNo + ',';
      });
      this.dialogTitle = 'Edit';
    } else {
      this.billingModel = new SolarBillingModel({}, {}, { purchaseDate: new Date });
    }

    this.billingService.getAllBillings(this.login.companyId, this.session.id).subscribe(data => {
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



    this.sessionService.getAllAroundSessionYears().subscribe(data => {
      this.sessionYearList = data;
    });

    this.solarBillingService.getAllActiveSolarCustomers(this.login.companyId, false).subscribe(data => {
      this.customerDetails.reset(null);
      this.customers = [];
      data.forEach(customer => {
        if (customer.active) {
          this.solarCustomerModelMap.set(customer.id, customer);
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

    this.customerForm = this.fb.group({
      customerDetails: this.customerDetails,
      sessionYear: [this.session.id, [Validators.required]],
    });

    this.billForm = this.fb.group({
      solarSystemId: [this.billingModel.solarSystemId, [Validators.required]],
      solarSystemAmount: [0, [Validators.required]],
      // solarSystemGst: [0, [Validators.required]],

      capacity: [this.selectedCustomer.capacity, [Validators.required]],
      priceWithGST: [this.selectedCustomer.price, [Validators.required]],

      solarPanelId: [this.selectedCustomer.solarProductId, Validators.required],
      solarPanelQuantity: [this.selectedCustomer.solarPanelModels.length, [Validators.required, Validators.min(1)]],
      solarPanelSerial: [panelSerial, [Validators.required, Validators.min(1)]],

      inverterModelId: [this.selectedCustomer.inverterProductId, [Validators.required]],
      inverterQuantity: [1, [Validators.required, Validators.min(1)]],
      inverterSerial: [this.selectedCustomer.inverterSerial, [Validators.required, Validators.min(1)]],

      batteryModelId: [this.selectedCustomer.solarBatteryProductId],
      batteryQuantity: [this.selectedCustomer.solarBatteryModels.length],
      batterySerial: [batterySerial],

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

    this.utilsService.getBrandDetails().subscribe(data => {
      data.forEach(brand => {
        this.brandMap.set(brand.id, brand);
      });

      this.productService.getAllProducts(this.login.companyId).subscribe(data => {
        data.forEach(product => {
          if (product.productType == 14) {
            this.productMap.set(product.id, product);
            // this.solarSystemProduct = product;
            this.solarSystemList.push(product);
          } else if (product.productType == 10) {
            this.solarProductMap.set(product.id, this.brandMap.get(product.brandId)?.name + '-' + product.modelNo);
            this.productMap.set(product.id, product);
            this.solarProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          } else if (product.productType == 11 || product.productType == 12) {
            this.productMap.set(product.id, product);
            this.inverterProductMap.set(product.id, this.brandMap.get(product.brandId)?.name + '-' + product.modelNo);
            this.inverterProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          } else if (product.productType == 4) {
            this.batteryProductMap.set(product.id, this.brandMap.get(product.brandId)?.name + '-' + product.modelNo);
            this.productMap.set(product.id, product);
            this.batteryProductList.push({
              id: product.id,
              name: this.brandMap.get(product.brandId)?.name + '-' + product.modelNo
            });
          }
        });

        if (this.action == 'edit') {
          this.billingModel.solarBillingProductModels.forEach(solarBillingProductModel => {
            if (this.productMap.get(solarBillingProductModel.productId)?.productType == 14) {
              // this.billForm.get('solarSystemId').setValue(this.solarSystemProduct.id);
              this.billForm.get('solarSystemAmount').setValue(solarBillingProductModel.amount + solarBillingProductModel.gstAmount);
              // this.billForm.get('solarSystemGst').setValue(solarBillingProductModel.gstPercentage);
              // } else if (this.productMap.get(solarBillingProductModel.productId)?.productType == 18) {
              //   this.billForm.get('installation').setValue(this.installationProduct.id);
              //   this.billForm.get('installationAmount').setValue(solarBillingProductModel.amount + solarBillingProductModel.gstAmount);
              //   this.billForm.get('installationGst').setValue(solarBillingProductModel.gstPercentage);
            }
          });
        }
      });
    });

    this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }
      this.company = companyModel;

      this.utilsService.getSerialKey(this.company.id, this.session.id).subscribe(serialKeyModel => {
        this.serialKeyModel = serialKeyModel;
        if (!this.serialKeyModel) {
          this.serialKeyModel = {
            companyId: this.company.id,
            serialKey: 0,
            sessionId: this.session.id
          };
        }
        if (this.action != 'edit') {
          this.finalForm.get('invoiceName').setValue(this.company.companyCode + '/' + this.session.name + '/');
          const invoiceSerial = this.serialKeyModel.serialKey;
          this.finalForm.get('invoiceSerial').setValue(invoiceSerial + 1);
        }
      });
    });

    this.utilsService.getAllPaymentType().subscribe(data => {
      data.forEach(paymentType => this.paymentTypeMap.set(paymentType.id, paymentType));
      if (this.action == 'edit') {
        this.isCheque = this.paymentTypeMap.get(this.billingModel.paymentMode).isCheque;
        this.isLoan = this.paymentTypeMap.get(this.billingModel.paymentMode).isLoan;

        this.updatePaymentTypeValidation();
      }
    });
  }

  private _filter(name: string): SolarCustomerModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }

  getCustomer(value) {
    this.selectedCustomer = value;

    this.billForm.get('capacity').setValue(this.selectedCustomer.capacity);
    this.billForm.get('priceWithGST').setValue(this.selectedCustomer.price);

    let panelSerial = '';
    this.selectedCustomer.solarPanelModels.forEach(solarPanelModel => {
      panelSerial += solarPanelModel.panelSerial + ', ';
    });

    let batterySerial = '';
    this.selectedCustomer.solarBatteryModels.forEach(solarPanelModel => {
      batterySerial += solarPanelModel.serialNo + ', ';
    });

    // const gstPercentage = this.productCategoryModelsMap.get(this.installationProduct.productType)?.gstPercentage;
    // const installationAmount = parseFloat((this.installationProduct.price + ((this.installationProduct.price * gstPercentage) / 100)).toFixed(2));

    // this.billForm.get('solarSystemId').setValue(this.solarSystemProduct.id);
    this.billForm.get('solarSystemAmount').setValue(this.selectedCustomer.price);
    // this.billForm.get('solarSystemGst').setValue(this.productCategoryModelsMap.get(this.solarSystemProduct.productType)?.gstPercentage);


    // this.billForm.get('installation').setValue(this.installationProduct.id);
    // this.billForm.get('installationAmount').setValue(installationAmount);
    // this.billForm.get('installationGst').setValue(gstPercentage);

    console.log(this.selectedCustomer);
    this.billForm.get('solarPanelId').setValue(this.selectedCustomer.solarProductId);
    this.billForm.get('solarPanelQuantity').setValue(this.selectedCustomer.solarPanelModels.length);
    this.billForm.get('solarPanelSerial').setValue(panelSerial);

    this.billForm.get('inverterModelId').setValue(this.selectedCustomer.inverterProductId);
    this.billForm.get('inverterQuantity').setValue(1);
    this.billForm.get('inverterSerial').setValue(this.selectedCustomer.inverterSerial);

    this.billForm.get('batteryModelId').setValue(this.selectedCustomer.solarBatteryProductId);
    this.billForm.get('batteryQuantity').setValue(this.selectedCustomer.solarBatteryModels.length);
    this.billForm.get('batterySerial').setValue(batterySerial);

    this.setTotalAmount();
  }


  onProductChange(event) {
    console.log(event.value);
    this.solarSystemGst = this.productCategoryModelsMap.get(this.productMap.get(event.value)?.productType)?.gstPercentage;
  }

  onQuantityChange(event) {
    const quantity: number = parseFloat((event.target as HTMLInputElement).value);
  }

  onPriceChange(event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.billForm.get('solarSystemAmount')?.setValue(this.selectedCustomer.price - amount);
    this.setTotalAmount();
  }

  setTotalAmount() {
    let finalAmount: number = this.selectedCustomer.price;
    let finalGstAmount: number = 0;
    let finalTotalAmount: number = this.selectedCustomer.price;

    const solarAmount: number = this.selectedCustomer.price;
    finalGstAmount += solarAmount - this.getExludedGST(solarAmount, 5);
    finalAmount -= finalGstAmount;

    this.finalForm.get('roundOffAmount').setValue(0);
    this.finalForm.get('amount').setValue(finalAmount.toFixed(2));
    this.finalForm.get('gstAmount').setValue(finalGstAmount.toFixed(2));
    this.finalForm.get('totalAmount').setValue(finalTotalAmount.toFixed(2));
    this.finalForm.get('totalAmountAfterroundOff').setValue(finalTotalAmount.toFixed(2));

  }

  getExludedGST(amount: number, gstPercentage: number) {
    return (amount * 100) / (gstPercentage + 100);
  }

  onPaymentTypeChange(event) {
    this.isCheque = this.paymentTypeMap.get(event.value).isCheque;
    this.isLoan = this.paymentTypeMap.get(event.value).isLoan;
    this.updatePaymentTypeValidation();
  }

  updatePaymentTypeValidation() {
    if (this.isCheque) {
      this.finalForm.get('chequeNo').setValidators([Validators.required]);
      this.finalForm.get('bankName').setValidators([Validators.required]);
    } else if (this.isLoan) {
      this.finalForm.get('chequeNo').clearValidators();
      this.finalForm.get('bankName').clearValidators();
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
    this.addNewSolarBillingModel();
  }

  addNewSolarBillingModel() {
    const billingModel = new SolarBillingModel(this.customerForm.value, this.billForm.value, this.finalForm.value);
    billingModel.customerId = this.selectedCustomer.id;
    billingModel.companyId = this.login.companyId;
    this.serialKeyModel.serialKey = billingModel.invoiceSerial;

    if (this.action == 'edit') {
      billingModel.id = this.billingModel.id;
    }

    const billingProductModels: SolarBillingProductModel[] = [];

    const solarSystemTotalAmount = this.billForm.get("solarSystemAmount").value;
    // const solarSystemGst = this.billForm.get("solarSystemGst").value;
    const solarSystemAmount = parseFloat(this.getExludedGST(solarSystemTotalAmount, this.solarSystemGst).toFixed(2));

    billingProductModels.push({
      companyId: this.login.companyId,
      productId: this.billForm.get("solarSystemId").value,
      quantity: 1,
      gstPercentage: this.solarSystemGst,
      amount: solarSystemAmount,
      gstAmount: parseFloat((solarSystemTotalAmount - solarSystemAmount).toFixed(2)),
      totalAmount: solarSystemTotalAmount
    });

    billingModel.solarBillingProductModels = billingProductModels;

    this.billingService.addNewBilling(billingModel).pipe(first()).subscribe(data => {

      if (this.action != 'edit') {
        this.utilsService.updateSerialKey(this.serialKeyModel).subscribe(serialKeyModel => {
        });
      }

      let row = { title: "Do you want to print?", buttonCaption: 'Print' };
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: row,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result == 1) {
          this.router.navigateByUrl('billing/finance/solar/solar-billing-receipt', { state: { billingModel: data, action: 'view' } });
        } else {
          this.router.navigate(['billing/finance/solar/all-solar-billings']);
        }
      });
    });

  }

}
