import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CommonLayout } from '../../../shared/shared-layout/share.layout';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { CompanyService } from '../../../company-settings/company.service';
import { first, map, startWith } from 'rxjs/operators';
import { CompanyModel } from '../../../company-settings/company.model';
import { settings } from '../../../demo/data';
import { formatDate } from '@angular/common';
import { PaymentTypeModel } from '../../../shared/common.models';
import { UtilsService } from '../../../shared/services/utils.service';
import { Utils } from '../../../shared/util-class';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginModel } from '../../../auth/login-model';
import { CashReceiptModel } from '../document.model';
import { DocumentService } from '../document.service';
import { DocumentPdfService } from '../document-pdf.service';
import { SolarCustomerModel } from '../../solar/solar-billing.model';
import { SolarService } from '../../solar/solar.service';

@Component({
  selector: 'app-add-money-receipt-format',
  templateUrl: './add-money-receipt-format.component.html',
  styleUrls: ['./add-money-receipt-format.component.sass']
})

export class AddMoneyReceiptFormatComponent implements OnInit {

  customerForm: FormGroup;

  spinnerButtonOptions: MatProgressButtonOptions;
  companyModel: CompanyModel;
  currency = settings.CURRENCY;
  currencyInWord = settings.CURRENCY_IN_WORD;

  action: string;
  previousInvoiceName: string;
  paymentTypeMap: Map<number, PaymentTypeModel> = new Map<number, PaymentTypeModel>();
  isCheque = false;
  cashReceiptModel: CashReceiptModel;
  dialogTitle: string = 'Add';

  customerDetails = new FormControl(null, [
    Validators.required,
    this.forbiddenNamesValidator()
  ]);
  filteredOptions: Observable<SolarCustomerModel[]>;
  selectedCustomer: SolarCustomerModel = new SolarCustomerModel({}, {});
  customerModelMap: Map<number, SolarCustomerModel> = new Map<number, SolarCustomerModel>();
  customers: SolarCustomerModel[] = [];

  login: LoginModel;

  amountInWords: string;

  constructor(
    private fb: FormBuilder,
    private commonLayout: CommonLayout,
    private pdfService: PdfService,
    private companyService: CompanyService,
    private utilsService: UtilsService,
    private documentService: DocumentService,
    private solarBillingService: SolarService,
    private localStorageData: LocalStorageData,
    private router: Router,
    private documentPdfService: DocumentPdfService,

    public utils: Utils,
  ) { }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.action = history.state.action;
    if (this.action == 'edit' || this.action == 'view') {
      this.cashReceiptModel = history.state.cashReceiptModel;
      this.dialogTitle = 'Edit';
    } else {
      this.cashReceiptModel = new CashReceiptModel({ purchaseDate: new Date });
    }

    this.solarBillingService.getAllActiveSolarCustomers(this.login.companyId, false).subscribe(data => {
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
    });

    this.spinnerButtonOptions = this.commonLayout.getprogressButton();
    this.customerForm = this.fb.group({
      customerName: [this.cashReceiptModel.customerName, [Validators.required]],
      mobile: [this.cashReceiptModel.mobile, [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      district: [this.cashReceiptModel.district, [Validators.required]],
      pinCode: [this.cashReceiptModel.pinCode, [Validators.required]],
      amount: [this.cashReceiptModel.amount, [Validators.required, Validators.min(1)]],
      purchaseDate: [this.cashReceiptModel.purchaseDate, Validators.required],
      paymentMode: [this.cashReceiptModel.paymentMode, [Validators.required]],
      chequeNo: [this.cashReceiptModel.chequeNo, [Validators.required]],
      bankName: [this.cashReceiptModel.bankName, [Validators.required]],
      invoiceSerial: [this.cashReceiptModel.invoiceSerial, [Validators.required]],
      details: [this.cashReceiptModel.details],
      isPaid: [this.cashReceiptModel.paid],

    });

    if (this.action != 'edit' && this.action != 'view') {
      this.documentService.getLatestCashReceipt(this.login.companyId).subscribe(data => {

        const invoiceSerial = data ? data.invoiceSerial : 0;
        this.customerForm.get('invoiceSerial').setValue(invoiceSerial + 1);
        if (data) {
          this.previousInvoiceName = this.utils.formatToThreeDigits(invoiceSerial, 3, '0');
        }
      });
    }

    this.utilsService.getAllPaymentType().subscribe(data => {
      data.forEach(paymentType => this.paymentTypeMap.set(paymentType.id, paymentType));

      if (this.action == 'edit' || this.action == 'view') {
        this.isCheque = this.paymentTypeMap.get(this.cashReceiptModel.paymentMode)?.isCheque;

        this.updatePaymentTypeValidation();
      }
    });

    this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }
      this.companyModel = companyModel;
      this.customerForm.get('district').setValue(companyModel.district);
      this.customerForm.get('pinCode').setValue(companyModel.pinCode);
    });
  }

  convertAmtInWords(event) {
    const amount: number = parseFloat((event.target as HTMLInputElement).value);
    this.amountInWords = this.utils.convertToWords(amount);
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

  getCustomer(value) {
    this.selectedCustomer = value;

    this.customerForm.get('customerName').setValue(this.selectedCustomer.name);
    this.customerForm.get('district').setValue(this.selectedCustomer.district);
    this.customerForm.get('pinCode').setValue(this.selectedCustomer.pinCode);
    this.customerForm.get('mobile').setValue(this.selectedCustomer.mobile);
    // this.customerForm.get('amount').setValue(((this.selectedCustomer.price * 10) / 100));

  }

  private _filter(name: string): SolarCustomerModel[] {
    const filterValue = name.toLowerCase();
    return this.customers.filter(
      option => option.name.toLowerCase().indexOf(filterValue) == 0
    );
  }

  onPaymentTypeChange(event) {
    this.isCheque = this.paymentTypeMap.get(event.value).isCheque;
    this.updatePaymentTypeValidation();
  }

  updatePaymentTypeValidation() {
    if (this.isCheque) {

      this.customerForm.get('chequeNo').setValidators([Validators.required]);
      this.customerForm.get('bankName').setValidators([Validators.required]);
    } else {
      this.customerForm.get('chequeNo').clearValidators();
      this.customerForm.get('bankName').clearValidators();
    }
    this.customerForm.get('chequeNo').updateValueAndValidity();
    this.customerForm.get('bankName').updateValueAndValidity();
  }

  onSubmit() {
    const login = this.localStorageData.userValue;
    const cashReceiptModel = new CashReceiptModel(this.customerForm.value);
    if (this.action == 'edit') {
      cashReceiptModel.id = this.cashReceiptModel.id;
    }
    cashReceiptModel.companyId = login.companyId;
    cashReceiptModel.createdBy = login.id;

    if (this.action == 'view') {
      this.generateMoneyReceiptPDF(cashReceiptModel);
    } else {
      this.documentService.addNewCashReceipt(cashReceiptModel).pipe(first()).subscribe(data => {
        this.generateMoneyReceiptPDF(cashReceiptModel);
        this.router.navigate(['billing/finance/documents/all-money-receipts']);
      });
    }
  }

  generateMoneyReceiptPDF(cashReceiptModel, action = 'open') {
    const header = this.documentPdfService.createMoneyReceiptHeader(this.companyModel);
    this.pdfService.generateCustomPDF(this.companyModel, this.documentPdfService.getMoneyReceiptPDFData(cashReceiptModel, this.paymentTypeMap), header, undefined, [20, 100, 20, 70], this.documentPdfService.getMoneyReceiptBackgorundLogoPosition(), undefined, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', action);
  }



}
