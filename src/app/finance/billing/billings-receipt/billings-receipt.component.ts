import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { first } from 'rxjs/operators';
import { CompanyModel } from '../../../company-settings/company.model';
import { CompanyService } from '../../../company-settings/company.service';
import { monthMap, settings } from '../../../demo/data';
import { BrandModel, FullName, HsnCodeModel, PaymentTypeModel, ProductCategoryModel, StateModel } from '../../../shared/common.models';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { SessionService } from '../../../session/session.service';
import { CustomerModel } from '../../customers/customer.model';
import { CustomerService } from '../../customers/customer.service';
import { BillingModel } from '../billing.model';
import { BillingService } from '../billing.service';
import { UtilsService } from '../../../shared/services/utils.service';
import { ProductService } from '../../products/product.service';
import { ProductModel } from '../../products/product.model';
import { Utils } from '../../../shared/util-class';
import { SessionModel } from '../../../session/session.model';
import { LoginModel } from '../../../auth/login-model';
import { LocalStorageData } from '../../../shared/local-storage-data';
@Component({
  selector: 'app-billings-receipt',
  templateUrl: './billings-receipt.component.html',
  styleUrls: ['./billings-receipt.component.sass']
})
export class BillingReceiptComponent implements OnInit {
  billingModel: BillingModel;
  customer: CustomerModel;

  paymentTypeMap: Map<number, PaymentTypeModel> = new Map<number, PaymentTypeModel>();
  productMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  stateMap: Map<number, StateModel> = new Map<number, StateModel>();
  hsnCodeMap: Map<string, HsnCodeModel> = new Map<string, HsnCodeModel>();
  brandModels: BrandModel[];
  brandModelMap: Map<number, BrandModel> = new Map<number, BrandModel>();
  productCategoryModelsMap: Map<number, ProductCategoryModel> = new Map<number, ProductCategoryModel>();

  isCheque = false;
  company: CompanyModel;
  apiURL: string = environment.apiUrl;
  paidAmount: number = 0;
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  currency = settings.CURRENCY;
  currencyInWord = settings.CURRENCY_IN_WORD;

  totalQuantity: number;
  amountInWords: string;
  taxInWords: string;

  totalGST: number;

  sessionMap: Map<number, SessionModel> = new Map<number, SessionModel>();
  login: LoginModel;
  constructor(
    private utilsService: UtilsService,
    private companyService: CompanyService,
    private customerService: CustomerService,
    private billingService: BillingService,
    private productService: ProductService,
    public utils: Utils,
    private sessionService: SessionService,
    private localStorageData: LocalStorageData,
    private pdfService: PdfService,
    private router: Router,
  ) {
    if (history.state.action != 'view') {
      this.router.navigate(['billing/finance/billings/all-billings']);
    }

  }

  ngOnInit(): void {
    this.login = this.localStorageData.userValue;
    this.totalQuantity = 0;
    this.billingModel = history.state.billingModel;
    this.billingModel.billingProductModels.forEach(billingProductModel => {
      this.totalQuantity += billingProductModel.quantity;
    });

    this.utilsService.getBrandDetails().subscribe(data => {
      data.forEach(brand => this.brandModelMap.set(brand.id, brand));
    });

    this.utilsService.getAllProductCategory().subscribe(data => {
      data.forEach(productCategoryModel => this.productCategoryModelsMap.set(productCategoryModel.id, productCategoryModel));
    });

    this.amountInWords = this.utils.convertToWords(this.billingModel.totalAmount - this.billingModel.roundOffAmount);
    this.taxInWords = this.utils.convertToWords(this.billingModel.gstAmount);
    this.sessionService.getAllSessionYears().subscribe(data => {
      data.forEach(element => {
        this.sessionMap.set(element.id, element);
      });
    });
    this.companyService.getCompanyDetails(this.billingModel.companyId).pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }
      this.company = companyModel;

    });

    this.customerService.getCustomer(this.billingModel.customerId).subscribe(customers => {
      this.customer = customers;
    });

    this.utilsService.getAllPaymentType().subscribe(data => data.forEach(paymentType => this.paymentTypeMap.set(paymentType.id, paymentType)));
    this.utilsService.getStates(1).subscribe(data => data.forEach(state => this.stateMap.set(state.id, state)));
    this.productService.getAllProducts(this.login.companyId).subscribe(data => {
      data.forEach(product => {
        this.productMap.set(product.id, product);
      });
      this.billingModel.billingProductModels.forEach(billingProductModel => {
        const hsnCode = this.productMap.get(billingProductModel.productId).hsnCode;
        let hsnCodeModel: HsnCodeModel = this.hsnCodeMap.get(hsnCode) ? this.hsnCodeMap.get(hsnCode) : new HsnCodeModel();
        if (hsnCodeModel.code == undefined) {
          hsnCodeModel.code = hsnCode;
          hsnCodeModel.amount = 0;
          hsnCodeModel.gstPercentage = billingProductModel.gstPercentage / 2;

          hsnCodeModel.taxableAmount = 0;
        }
        hsnCodeModel.amount = parseFloat((hsnCodeModel.amount + billingProductModel.amount).toFixed(2));
        hsnCodeModel.taxableAmount = parseFloat((hsnCodeModel.taxableAmount + (billingProductModel.gstAmount / 2)).toFixed(2));
        this.totalGST += hsnCodeModel.taxableAmount;
        this.hsnCodeMap.set(hsnCode, hsnCodeModel);
      });

    });
  }


  generatePDF(action = 'open') {
    this.pdfService.generateInvoicePDF('Tax Invoice', this.company, this.getPostTableData(), { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', action);
  }

  private getPostTableData() {
    const data = this.createPDFData();
    return [
      {
        style: 'subheaderLeft',
        color: '#444',
        table: {
          widths: ['7%', '28%', '12%', '10%', '12%', '12%', '12%', '12%'],
          body: data
        }
      },
    ];
  }


  private createPDFData() {
    let data = [];
    let index = 0;

    data.push([{ rowSpan: 4, colSpan: 3, text: [{ text: this.company.companyName + '\n', bold: true }, this.company.address + '\n', this.company.district + '\n', 'Mobile No. : ' + this.company.mobile + '\n', 'PAN : ' + this.company.panNo + '\n', 'GSTIN/UIN : ' + this.company.gstNo + '\n', 'State Name : ' + this.stateMap.get(this.company.stateId).name + ', Code : ' + this.stateMap.get(this.company.stateId).gstCode + '\n', 'Email : ' + this.company.email + '\n'] }, '', '', { colSpan: 2, text: ['Invoice No.\n', { text: this.billingModel.invoiceName + this.utils.formatToThreeDigits(this.billingModel.invoiceSerial, 3, '0'), bold: true }] }, '', { colSpan: 3, text: ['Dated\n', { text: formatDate(this.billingModel.purchaseDate, settings.SHOW_DATE_FORMAT, 'en'), bold: true }] }, '', '']);
    data.push(['', '', '', { colSpan: 2, text: 'Delivery note\n ' }, '', { colSpan: 3, text: 'Mode/Terms of Payment\n' }, '', '']);
    data.push(['', '', '', { colSpan: 2, text: 'Reference No. & Date\n ' }, '', { colSpan: 3, text: 'Other References\n' }, '', '']);
    data.push(['', '', '', { colSpan: 2, text: 'Buyer Order no.\n ' }, '', { colSpan: 3, text: 'Dated' }, '', '']);

    data.push([{ rowSpan: 2, colSpan: 3, text: ['Consignee (Ship to)' + '\n', { text: this.customer.name + '\n', bold: true }, this.customer.address + '\n', 'Mobile No. : ' + this.customer.mobile + '\n', 'GSTIN/UIN : ' + this.customer.gstNo + '\n', 'State Name : ' + this.stateMap.get(this.customer.stateId).name + ', Code : ' + this.stateMap.get(this.customer.stateId).gstCode] }, '', '', { colSpan: 2, text: 'Dispatch Doc No.\n ' }, '', { colSpan: 3, text: 'Delivery Note Date' }, '', '']);
    data.push(['', '', '', { colSpan: 2, text: 'Dispatched Through\n ' }, '', { colSpan: 3, text: 'Destination' }, '', '']);

    data.push([{ rowSpan: 2, colSpan: 3, text: ['Buyer (Bill to)' + '\n', { text: this.customer.name + '\n', bold: true }, this.customer.address + '\n', 'Mobile No. : ' + this.customer.mobile + '\n', 'GSTIN/UIN : ' + this.customer.gstNo + '\n', 'State Name : ' + this.stateMap.get(this.customer.stateId).name + ', Code : ' + this.stateMap.get(this.customer.stateId).gstCode] }, '', '', { rowSpan: 2, colSpan: 5, text: 'Terms of Delivery' }, '', '', '', '']);
    data.push(['', '', '', '', '', '', '', '']);

    data.push([{ text: 'Sr. No.', alignment: 'center' }, { colSpan: 2, text: 'Description of goods', alignment: 'center' }, '', { text: 'HSN/SAC', alignment: 'center' }, { text: 'Quantity', alignment: 'center' }, { text: 'Rate', alignment: 'center' }, { text: 'per', alignment: 'center' }, { text: 'Amount', alignment: 'center' }]);

    this.billingModel.billingProductModels.forEach(billingProductModel => {
      let row = [];
      row.push({ text: (++index).toString() });
      row.push({
        colSpan: 2, text: [{
          text: this.brandModelMap.get(this.productMap.get(billingProductModel.productId).brandId).name + ' ' + this.productMap.get(billingProductModel.productId).modelNo + ' ' + this.productCategoryModelsMap.get(this.productMap.get(billingProductModel.productId).productType).name + '\n'
        }, billingProductModel.serialNo], bold: true
      });
      row.push({ text: '' });
      row.push({ text: this.productMap.get(billingProductModel.productId).hsnCode });
      row.push({ text: billingProductModel.quantity + ' Pcs', bold: true, alignment: 'right' });
      row.push({ text: billingProductModel.amountPerUnit, alignment: 'right' });
      row.push({ text: 'Pcs' });
      row.push({ text: billingProductModel.amountPerUnit, bold: true, alignment: 'right' });

      data.push(row);
    });
    data.push([{ colSpan: 7, text: '' }, '', '', '', '', '', '', { text: this.billingModel.amount, alignment: 'right' }]);

    data.push([{ colSpan: 3, text: 'Output CGST', bold: true, alignment: 'right' }, '', '', '', '', '', '', { text: this.billingModel.gstAmount / 2, bold: true, alignment: 'right' }]);
    data.push([{ colSpan: 3, text: 'Output SGST', bold: true, alignment: 'right' }, '', '', '', '', '', '', { text: this.billingModel.gstAmount / 2, bold: true, alignment: 'right' }]);
    data.push([{ colSpan: 3, text: 'Round Off (+/-)', bold: true, alignment: 'right' }, '', '', '', '', '', '', { text: this.billingModel.roundOffAmount, bold: true, alignment: 'right' }]);
    data.push([{ colSpan: 3, text: 'Total', alignment: 'right' }, '', '', '', { text: this.totalQuantity + ' Pcs', bold: true, alignment: 'right' }, '', '', {
      text: this.currency + (this.billingModel.totalAmount -
        this.billingModel.roundOffAmount), bold: true, alignment: 'right'
    }]);
    data.push([{ colSpan: 7, text: ['Amount Chargeable (in words)\n', { text: (this.currencyInWord + ' ' + this.amountInWords) + ' Only', bold: true }] }, '', '', '', '', '', '', { text: 'E. & O.E.', alignment: 'right' }]);
    data.push([{ colSpan: 2, rowSpan: 2, text: 'HSN/SAC', alignment: 'center' }, '', { rowSpan: 2, text: 'Taxable Value', alignment: 'center' }, { colSpan: 2, text: 'CGST', alignment: 'center' }, '', { colSpan: 2, text: 'SGST/UTGST', alignment: 'center' }, '', { rowSpan: 2, text: 'Total Tax Amount', alignment: 'center' }]);
    data.push(['', '', '', { text: 'Rate', alignment: 'center' }, { text: 'Amount', alignment: 'center' }, { text: 'Rate', alignment: 'center' }, { text: 'Amount', alignment: 'center' }, '']);

    this.hsnCodeMap.forEach((value, key) => {
      let row = [];
      row.push({ colSpan: 2, text: key });
      row.push({ text: '' });
      row.push({ text: value.amount, alignment: 'right' });
      row.push({ text: value.gstPercentage + '%', alignment: 'right' });
      row.push({ text: value.taxableAmount, alignment: 'right' });
      row.push({ text: value.gstPercentage + '%', alignment: 'right' });
      row.push({ text: value.taxableAmount, alignment: 'right' });
      row.push({ text: value.taxableAmount * 2, alignment: 'right' });


      data.push(row);
    });

    data.push([{ colSpan: 2, text: 'Total', bold: true, alignment: 'right' }, '', { text: this.billingModel.amount, bold: true, alignment: 'right' }, '', { text: this.billingModel.gstAmount / 2, bold: true, alignment: 'right' }, '', { text: this.billingModel.gstAmount / 2, bold: true, alignment: 'right' }, { text: this.billingModel.gstAmount, bold: true, alignment: 'right' }]);

    data.push([{ colSpan: 8, text: ['Tax Amount (in words)\n', { text: (this.currencyInWord + ' ' + this.taxInWords + ' Only'), bold: true }] }, '', '', '', '', '', '', '']);

    data.push([{ colSpan: 3, text: '' }, '', '', { colSpan: 5, text: ["Company's Bank Details\nBank Name : ", { text: this.company.bankName, bold: true }, "\n A/C no.: ", { text: this.company.accountNo, bold: true }, "\nBranch and IFS Code : ", { text: this.company.bankAddress + ' & ' + this.company.ifsc, bold: true }] }, '', '', '', '']);
    data.push([{ colSpan: 4, text: ["Company's PAN :", { text: this.company.panNo, bold: true }] }, '', '', '', { colSpan: 4, rowSpan: 2, text: [{ text: 'For ' + this.company.companyName }, { text: '\n\n\n\n\n\nAuthorised Signatory' }], bold: true, alignment: 'right' }, '', '', '']);
    data.push([{ colSpan: 4, text: 'Declaration:\n We declare that this invoice shows the actual price of the goods described and that all perticulars are true and correct.' }, '', '', '', '', '', '', '']);
    return data;
  }
}
