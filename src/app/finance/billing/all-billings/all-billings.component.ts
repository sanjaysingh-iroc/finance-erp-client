import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { BillingModel } from '../billing.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, Observable, merge } from 'rxjs';
import { DeleteDialogComponent } from '../../../shared/dialog/delete/delete.component';
import { first, map } from 'rxjs/operators';
import { BillingService } from '../billing.service';
import { monthMap, settings } from '../../../demo/data';
import { NotificationsService } from '../../../shared/notifications-service';
import { CustomerService } from '../../customers/customer.service';
import { Router } from '@angular/router';
import { BrandModel, FullName, HsnCodeModel, PaymentTypeModel, ProductCategoryModel, StateModel } from '../../../shared/common.models';

import { LocalStorageData } from '../../../shared/local-storage-data';
import { SessionModel } from '../../../session/session.model';
import { ExcelExportService } from '../../../shared/excelExport/excelExport-service';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { CustomerModel } from '../../customers/customer.model';
import { formatDate } from '@angular/common';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { UtilsService } from '../../../shared/services/utils.service';
import { Utils } from '../../../shared/util-class';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';
import { LoginModel } from '../../../auth/login-model';
import { SessionService } from '../../../session/session.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CompanyModel } from '../../../company-settings/company.model';
import { CompanyService } from '../../../company-settings/company.service';
import { ProductService } from '../../products/product.service';
import { ProductModel } from '../../products/product.model';
@Component({
  selector: 'app-all-billings',
  templateUrl: './all-billings.component.html',
  styleUrls: ['./all-billings.component.sass'],
})

export class AllBillingComponent implements OnInit {
  displayedColumns = [
    'srNo',
    'sName',
    'invoiceNo',
    'mobile',
    'date',
    'pType',
    'totalamount',
    'createdBy',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<BillingModel>(true, []);
  billingModel: BillingModel | null;
  dataChange: BehaviorSubject<BillingModel[]> = new BehaviorSubject<BillingModel[]>([]);
  customerId = new FormControl('');
  sessionYear = new FormControl('');
  startDate = new FormControl('');
  endDate = new FormControl('');

  allCustomerList: CustomerModel[] = [];
  allBillingModels: BillingModel[];
  filteredBillingModels: BillingModel[];

  customerMapChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  customerMap: Map<number, CustomerModel> = new Map<number, CustomerModel>();
  paymentTypeMap: Map<number, PaymentTypeModel> = new Map<number, PaymentTypeModel>();
  showDateFormat: string;
  session: SessionModel;
  monthMap: Map<number, FullName> = monthMap;
  currency = settings.CURRENCY;
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();
  login: LoginModel;
  sessionYearList: SessionModel[];
  sessionMap: Map<number, SessionModel> = new Map<number, SessionModel>();
  currencyInWord = settings.CURRENCY_IN_WORD;

  minDate: Date;
  maxDate: Date;

  startDateFormat: Date;
  endDateFormat: Date;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  company: CompanyModel;
  brandModelMap: Map<number, BrandModel> = new Map<number, BrandModel>();
  productMap: Map<number, ProductModel> = new Map<number, ProductModel>();
  productCategoryModelsMap: Map<number, ProductCategoryModel> = new Map<number, ProductCategoryModel>();

  stateMap: Map<number, StateModel> = new Map<number, StateModel>();

  constructor(
    private dialog: MatDialog,
    private billingService: BillingService,
    private customerService: CustomerService,
    private utilsService: UtilsService,
    public utils: Utils,
    private notification: NotificationsService,
    private staffService: StaffService,
    private pdfService: PdfService,
    private excelExportService: ExcelExportService,
    private sessionService: SessionService,
    private localStorageData: LocalStorageData,
    private companyService: CompanyService,
    private productService: ProductService,

    private router: Router
  ) { }

  ngOnInit() {
    this.session = this.localStorageData.sessionValue;
    this.login = this.localStorageData.userValue;

    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.utilsService.getStates(1).subscribe(data => data.forEach(state => this.stateMap.set(state.id, state)));

    this.sessionService.getAllAroundSessionYears().subscribe(data => {
      this.sessionYearList = data;
      data.forEach(sessionModel => this.sessionMap.set(sessionModel.id, sessionModel));
    });

    this.sessionYear.setValue(this.session.id);
    this.minDate = new Date(this.session.fromDate);
    this.maxDate = new Date(this.session.toDate);

    this.utilsService.getAllPaymentType()
      .subscribe(data => data.forEach(element => this.paymentTypeMap.set(element.id, element)));

    this.staffService.getAllUsers(this.login.companyId).subscribe(data => {
      data.forEach(staffModel => this.staffMap.set(staffModel.id, staffModel));
    });

    this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }
      this.company = companyModel;

    });

    this.utilsService.getAllProductCategory().subscribe(data => {
      data.forEach(productCategoryModel => this.productCategoryModelsMap.set(productCategoryModel.id, productCategoryModel));
    });

    this.utilsService.getBrandDetails().subscribe(data => {
      data.forEach(brand => this.brandModelMap.set(brand.id, brand));
    });

    this.productService.getAllProducts(this.login.companyId).subscribe(data => {
      data.forEach(product => {
        this.productMap.set(product.id, product);
      });

    });

    this.customerMapChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
    const customerNameMap: Map<number, string> = new Map<number, string>();

    this.customerService.getAllCustomers(this.login.companyId).subscribe(data => {
      this.allCustomerList = data;
      this.allCustomerList.sort((a, b) => a.name.localeCompare(b.name));

      data.forEach(element => {
        customerNameMap.set(element.id, element.name);
        this.customerMap.set(element.id, element);
      });
      this.customerMapChange.next(customerNameMap);
    });

    this.loadData();
  }

  addNew() {
    this.router.navigate(['billing/finance/billings/add-billing']);
  }

  viewBillingDetails(billingModel) {
    this.router.navigateByUrl('billing/finance/billings/billing-receipt', { state: { billingModel: billingModel, action: 'view' } });
  }

  deleteItem(billingModel) {
    const id = billingModel.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: billingModel.invoiceName,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.billingService.deleteBilling(id).subscribe(() => {
          const foundIndex = this.dataChange.value.findIndex(
            (x) => x.id == id
          );
          this.dataChange.value.splice(foundIndex, 1);
          this.refreshTable();
          this.notification.showDangerNotification(
            'Delete Record Successfully...!!!',
            'bottom'
          );
        },
          (error: HttpErrorResponse) => {
            this.notification.showDangerNotification(
              'Record can not be deleted...!!!',
              'bottom'
            );
          });
      }
    });
  }

  editCall(row) {
    this.router.navigateByUrl('billing/finance/billings/add-billing', { state: { billingModel: row, action: 'edit' } });
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  approveItem(row) {

    this.billingService.approveBilling(row.id, this.login.id)
      .subscribe(data => {
        this.loadData();
        this.notification.showSuccessNotification(
          'Loan has been Approved Successfully...!!!',
          'bottom'
        );
      }, error => {
        this.notification.showDangerNotification(
          'Loan has not been Approved Successfully...!!!',
          'bottom'
        );
      });
  }

  public loadData() {

    this.dataChange = new BehaviorSubject<BillingModel[]>([]);

    console.log(this.session.id)

    this.billingService.getAllBillings(this.login.companyId, this.session.id).subscribe(data => {
      this.dataChange.next(data);
      this.allBillingModels = data;
      this.filteredBillingModels = data;
    });

    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.customerMapChange
    );
    fromEvent(this.filter.nativeElement, 'keyup')
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  onDateChange() {
    this.startDateFormat = this.startDate.value;
    this.endDateFormat = this.endDate.value;
    if (this.endDateFormat != null) {
      this.getCustomerBillings();
    }
  }

  onSessionChange(event) {
    this.startDate.setValue(null);
    this.endDate.setValue(null);

    this.startDateFormat = null;
    this.endDateFormat = null;
    this.session = this.sessionMap.get(event.value);

    this.minDate = new Date(this.session.fromDate);
    this.maxDate = new Date(this.session.toDate);


    this.loadData();
  }

  getCustomerBillings() {

    let allBillingModels: BillingModel[] = [...this.allBillingModels];

    const customerId = this.customerId.value;
    if (customerId != 0) {
      allBillingModels = allBillingModels.filter(billingModel => billingModel.customerId == customerId);
    }

    const sessionYear = this.sessionYear.value;
    if (sessionYear != 0) {
      allBillingModels = allBillingModels.filter(billingModel => billingModel.sessionYear == sessionYear);
    }


    if (this.endDateFormat != null) {
      allBillingModels = allBillingModels.filter(item => {
        const itemDate = new Date(item.purchaseDate);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= this.startDateFormat && itemDate <= this.endDateFormat;
      });
    }

    this.filteredBillingModels = allBillingModels;
    this.dataChange.next(allBillingModels);
    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort,
      this.customerMapChange
    );
    fromEvent(this.filter.nativeElement, 'keyup')
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  generatePDF(action = 'open') {
    this.pdfService.generateInvoicePDF('', this.company, this.getPostTableData(), { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', action);
  }

  private getPostTableData() {

    let postTableData: any[] = [];

    for (let i = 0; i < this.filteredBillingModels.length; i++) {

      const billingModel = this.filteredBillingModels[i];
      let data: any[] = [];
      const customer: CustomerModel = this.customerMap.get(billingModel.customerId);
      this.createPDFData(data, customer, billingModel);

      postTableData.push(
        {
          text: 'Tax Invoice', style: 'sectionHeader'
        }

      );
      postTableData.push(
        {
          style: 'subheaderLeft',
          color: '#444',
          table: {
            widths: ['7%', '28%', '12%', '10%', '12%', '12%', '12%', '12%'],
            body: data
          }
        }
      );
      if (i < this.filteredBillingModels.length - 1) {
        postTableData.push({ text: "", pageBreak: 'before' });
      }
    }

    return postTableData;
  }

  private createPDFData(data, customer: CustomerModel, billingModel: BillingModel) {
    const hsnCodeMap: Map<string, HsnCodeModel> = new Map<string, HsnCodeModel>();
    let totalGST = 0;

    const amountInWords = this.utils.convertToWords(billingModel.totalAmount - billingModel.roundOffAmount);
    const taxInWords = this.utils.convertToWords(billingModel.gstAmount);

    billingModel.billingProductModels.forEach(billingProductModel => {
      const hsnCode = this.productMap.get(billingProductModel.productId).hsnCode;
      let hsnCodeModel: HsnCodeModel = hsnCodeMap.get(hsnCode) ? hsnCodeMap.get(hsnCode) : new HsnCodeModel();
      if (hsnCodeModel.code == undefined) {
        hsnCodeModel.code = hsnCode;
        hsnCodeModel.amount = 0;
        hsnCodeModel.gstPercentage = billingProductModel.gstPercentage / 2;
        hsnCodeModel.taxableAmount = 0;
      }
      hsnCodeModel.amount = parseFloat((hsnCodeModel.amount + billingProductModel.amount).toFixed(2));
      hsnCodeModel.taxableAmount = parseFloat((hsnCodeModel.taxableAmount + (billingProductModel.gstAmount / 2)).toFixed(2));
      totalGST += hsnCodeModel.taxableAmount;
      hsnCodeMap.set(hsnCode, hsnCodeModel);
    });
    let totalQuantity = 0;
    billingModel.billingProductModels.forEach(billingProductModel => {
      totalQuantity += billingProductModel.quantity;
    });


    // let data = [];
    let index = 0;

    data.push([{ rowSpan: 4, colSpan: 3, text: [{ text: this.company.companyName + '\n', bold: true }, this.company.address + '\n', this.company.district + '\n', 'Mobile No. : ' + this.company.mobile + '\n', 'PAN : ' + this.company.panNo + '\n', 'GSTIN/UIN : ' + this.company.gstNo + '\n', 'State Name : ' + this.stateMap.get(this.company.stateId).name + ', Code : ' + this.stateMap.get(this.company.stateId).gstCode + '\n', 'Email : ' + this.company.email + '\n'] }, '', '', { colSpan: 2, text: ['Invoice No.\n', { text: billingModel.invoiceName + this.utils.formatToThreeDigits(billingModel.invoiceSerial, 3, '0'), bold: true }] }, '', { colSpan: 3, text: ['Dated\n', { text: formatDate(billingModel.purchaseDate, settings.SHOW_DATE_FORMAT, 'en'), bold: true }] }, '', '']);
    data.push(['', '', '', { colSpan: 2, text: 'Delivery note\n ' }, '', { colSpan: 3, text: 'Mode/Terms of Payment\n' }, '', '']);
    data.push(['', '', '', { colSpan: 2, text: 'Reference No. & Date\n ' }, '', { colSpan: 3, text: 'Other References\n' }, '', '']);
    data.push(['', '', '', { colSpan: 2, text: 'Buyer Order no.\n ' }, '', { colSpan: 3, text: 'Dated' }, '', '']);

    data.push([{ rowSpan: 2, colSpan: 3, text: ['Consignee (Ship to)' + '\n', { text: customer.name + '\n', bold: true }, customer.address + '\n', 'Mobile No. : ' + customer.mobile + '\n', 'GSTIN/UIN : ' + customer.gstNo + '\n', 'State Name : ' + this.stateMap.get(customer.stateId).name + ', Code : ' + this.stateMap.get(customer.stateId).gstCode] }, '', '', { colSpan: 2, text: 'Dispatch Doc No.\n ' }, '', { colSpan: 3, text: 'Delivery Note Date' }, '', '']);
    data.push(['', '', '', { colSpan: 2, text: 'Dispatched Through\n ' }, '', { colSpan: 3, text: 'Destination' }, '', '']);

    data.push([{ rowSpan: 2, colSpan: 3, text: ['Buyer (Bill to)' + '\n', { text: customer.name + '\n', bold: true }, customer.address + '\n', 'Mobile No. : ' + customer.mobile + '\n', 'GSTIN/UIN : ' + customer.gstNo + '\n', 'State Name : ' + this.stateMap.get(customer.stateId).name + ', Code : ' + this.stateMap.get(customer.stateId).gstCode] }, '', '', { rowSpan: 2, colSpan: 5, text: 'Terms of Delivery' }, '', '', '', '']);
    data.push(['', '', '', '', '', '', '', '']);

    data.push([{ text: 'Sr. No.', alignment: 'center' }, { colSpan: 2, text: 'Description of goods', alignment: 'center' }, '', { text: 'HSN/SAC', alignment: 'center' }, { text: 'Quantity', alignment: 'center' }, { text: 'Rate', alignment: 'center' }, { text: 'per', alignment: 'center' }, { text: 'Amount', alignment: 'center' }]);

    billingModel.billingProductModels.forEach(billingProductModel => {
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
    data.push([{ colSpan: 7, text: '' }, '', '', '', '', '', '', { text: billingModel.amount, alignment: 'right' }]);

    data.push([{ colSpan: 3, text: 'Output CGST', bold: true, alignment: 'right' }, '', '', '', '', '', '', { text: billingModel.gstAmount / 2, bold: true, alignment: 'right' }]);
    data.push([{ colSpan: 3, text: 'Output SGST', bold: true, alignment: 'right' }, '', '', '', '', '', '', { text: billingModel.gstAmount / 2, bold: true, alignment: 'right' }]);
    data.push([{ colSpan: 3, text: 'Round Off (+/-)', bold: true, alignment: 'right' }, '', '', '', '', '', '', { text: billingModel.roundOffAmount, bold: true, alignment: 'right' }]);
    data.push([{ colSpan: 3, text: 'Total', alignment: 'right' }, '', '', '', { text: totalQuantity + ' Pcs', bold: true, alignment: 'right' }, '', '', {
      text: this.currency + (billingModel.totalAmount -
        billingModel.roundOffAmount), bold: true, alignment: 'right'
    }]);
    data.push([{ colSpan: 7, text: ['Amount Chargeable (in words)\n', { text: (this.currencyInWord + ' ' + amountInWords) + ' Only', bold: true }] }, '', '', '', '', '', '', { text: 'E. & O.E.', alignment: 'right' }]);
    data.push([{ colSpan: 2, rowSpan: 2, text: 'HSN/SAC', alignment: 'center' }, '', { rowSpan: 2, text: 'Taxable Value', alignment: 'center' }, { colSpan: 2, text: 'CGST', alignment: 'center' }, '', { colSpan: 2, text: 'SGST/UTGST', alignment: 'center' }, '', { rowSpan: 2, text: 'Total Tax Amount', alignment: 'center' }]);
    data.push(['', '', '', { text: 'Rate', alignment: 'center' }, { text: 'Amount', alignment: 'center' }, { text: 'Rate', alignment: 'center' }, { text: 'Amount', alignment: 'center' }, '']);

    hsnCodeMap.forEach((value, key) => {
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

    data.push([{ colSpan: 2, text: 'Total', bold: true, alignment: 'right' }, '', { text: billingModel.amount, bold: true, alignment: 'right' }, '', { text: billingModel.gstAmount / 2, bold: true, alignment: 'right' }, '', { text: billingModel.gstAmount / 2, bold: true, alignment: 'right' }, { text: billingModel.gstAmount, bold: true, alignment: 'right' }]);

    data.push([{ colSpan: 8, text: ['Tax Amount (in words)\n', { text: (this.currencyInWord + ' ' + taxInWords + ' Only'), bold: true }] }, '', '', '', '', '', '', '']);

    data.push([{ colSpan: 3, text: '' }, '', '', { colSpan: 5, text: ["Company's Bank Details\nBank Name : ", { text: this.company.bankName, bold: true }, "\n A/C no.: ", { text: this.company.accountNo, bold: true }, "\nBranch and IFS Code : ", { text: this.company.bankAddress + ' & ' + this.company.ifsc, bold: true }] }, '', '', '', '']);
    data.push([{ colSpan: 4, text: ["Company's PAN :", { text: this.company.panNo, bold: true }] }, '', '', '', { colSpan: 4, rowSpan: 2, text: [{ text: 'For ' + this.company.companyName }, { text: '\n\n\n\n\n\nAuthorised Signatory' }], bold: true, alignment: 'right' }, '', '', '']);
    data.push([{ colSpan: 4, text: 'Declaration:\n We declare that this invoice shows the actual price of the goods described and that all perticulars are true and correct.' }, '', '', '', '', '', '', '']);

    return data;
  }
}

export class ExampleDataSource extends DataSource<BillingModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: BillingModel[] = [];
  renderedData: BillingModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<BillingModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort,
    public dataChange1: BehaviorSubject<Map<number, string>>
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): BillingModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<BillingModel[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page,
    ];
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        const customerMap: Map<number, string> = this.dataChange1.value;
        this.filteredData = this.data
          .slice()
          .filter((billingModel: BillingModel) => {
            const searchStr = (
              billingModel.purchaseDate +
              customerMap.get(billingModel.customerId) +
              billingModel.amount

            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());
        // Grab the page's slice of the filtered sorted data.
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this._paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }
  disconnect() { }
  /** Returns a sorted copy of the database data. */
  sortData(data: BillingModel[]): BillingModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'id':
          [propertyA, propertyB] = [a.id, b.id];
          break;

      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1)
      );
    });
  }
}
