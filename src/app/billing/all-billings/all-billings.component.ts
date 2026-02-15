import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { BillingModel } from '../billing.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, Observable, merge } from 'rxjs';
import { DeleteDialogComponent } from '../../shared/dialog/delete/delete.component';
import { map } from 'rxjs/operators';
import { BillingService } from '../billing.service';
import { monthMap, settings } from '../../demo/data';
import { NotificationsService } from '../../shared/notifications-service';
import { CustomerService } from '../../customers/customer.service';
import { Router } from '@angular/router';
import { FullName, PaymentTypeModel } from '../../shared/common.models';

import { LocalStorageData } from '../../shared/local-storage-data';
import { SessionModel } from '../../session/session.model';
import { ExcelExportService } from '../../shared/excelExport/excelExport-service';
import { PdfService } from '../../shared/pdfServices/pdfExport';
import { CustomerModel } from '../../customers/customer.model';
import { formatDate } from '@angular/common';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { UtilsService } from '../../shared/services/utils.service';
import { Utils } from '../../shared/util-class';
import { StaffService } from '../../staff/staff.service';
import { StaffModel } from '../../staff/staff.model';
import { LoginModel } from '../../auth/login-model';

@Component({
  selector: 'app-all-billings',
  templateUrl: './all-billings.component.html',
  styleUrls: ['./all-billings.component.sass']
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
  allCustomerList: CustomerModel[] = [];
  allBillingModels: BillingModel[];
  customerMapChange: BehaviorSubject<Map<number, string>> = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
  customerMap: Map<number, CustomerModel> = new Map<number, CustomerModel>();
  paymentTypeMap: Map<number, PaymentTypeModel> = new Map<number, PaymentTypeModel>();
  showDateFormat: string;
  session: SessionModel;
  monthMap: Map<number, FullName> = monthMap;
  currency = settings.CURRENCY;
  staffMap: Map<number, StaffModel> = new Map<number, StaffModel>();
  login: LoginModel;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

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
    private localStorageData: LocalStorageData,
    private router: Router
  ) { }

  ngOnInit() {
    this.session = this.localStorageData.sessionValue;
    this.login = this.localStorageData.userValue;

    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.utilsService.getAllPaymentType()
      .subscribe(data => data.forEach(element => this.paymentTypeMap.set(element.id, element)));

    this.staffService.getAllUsers().subscribe(data => {
      data.forEach(staffModel => this.staffMap.set(staffModel.id, staffModel));
    });

    this.loadData();
  }

  addNew() {
    this.router.navigate(['pages/billings/add-billing']);
  }

  viewBillingDetails(billingModel) {
    this.router.navigateByUrl('pages/billings/billing-receipt', { state: { billingModel: billingModel, action: 'view' } });
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
    this.router.navigateByUrl('pages/billings/add-billing', { state: { billingModel: row, action: 'edit' } });
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
    this.customerMapChange = new BehaviorSubject<Map<number, string>>(new Map<number, string>());
    const customerNameMap: Map<number, string> = new Map<number, string>();

    this.customerService.getAllCustomers()
      .subscribe(data => {
        this.allCustomerList = data;
        this.allCustomerList.sort((a, b) => a.name.localeCompare(b.name));

        data.forEach(element => {
          customerNameMap.set(element.id, element.name);
          this.customerMap.set(element.id, element);
        });
        this.customerMapChange.next(customerNameMap);
      });

    this.dataChange = new BehaviorSubject<BillingModel[]>([]);

    this.billingService.getAllBillings().subscribe(data => {
      this.dataChange.next(data);
      this.allBillingModels = data;
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

  getCustomerBillings(event) {
    const customerId = event.value;
    let allBillingModels: BillingModel[] = [...this.allBillingModels];
    if (customerId != 0) {
      allBillingModels = allBillingModels.filter(billingModel => billingModel.customerId == customerId);
    }
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
    let data: string[][] = this.getData();
    this.pdfService.generatePDF('Billings Details', [], data, { alignment: 'center', margin: [30, 5, 0, 15] }, 'portrait', action, 1);
  }

  private getHeaderCaption() {
    return [
      { text: 'Sr. No.', style: 'tableHeader' },
      { text: 'Customer Name', style: 'tableHeader' },
      { text: 'Date', style: 'tableHeader' },
      { text: 'Payment Type', style: 'tableHeader' },
      { text: 'Amount', style: 'tableHeader' }
    ];
  }

  exportExcel() {
    let columns = [
      { header: 'Sr. No.', key: 'sr', width: 10 },
      { header: 'Customer Name', key: 'name', width: 20 },
      { header: 'Deposit Date', key: 'section', width: 20 },
    ];

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("AllBillings");
    worksheet.columns = columns;
    for (let i = 1; i <= columns.length; i++) {
      worksheet.getRow(1).getCell(i).style = this.excelExportService.HeaderStyle;
    }

    let index = 1;
    let srNo = 1;

    this.dataChange.value.map(billingModel => {

      let length = billingModel.billingProductModels.length;

      worksheet.mergeCells('A' + (index + 1) + ':A' + (index + length));
      worksheet.mergeCells('B' + (index + 1) + ':B' + (index + length));
      worksheet.mergeCells('D' + (index + 1) + ':D' + (index + length));
      worksheet.mergeCells('E' + (index + 1) + ':E' + (index + length));
      worksheet.mergeCells('F' + (index + 1) + ':F' + (index + length));

      let i = index + 1;


      index += length;
      worksheet.getCell('A' + index).value = srNo;
      worksheet.getCell('B' + index).value = this.customerMap.get(billingModel.customerId).name;
      worksheet.getCell('D' + index).value = formatDate(billingModel.purchaseDate, settings.SHOW_DATE_FORMAT, 'en');
      worksheet.getCell('E' + index).value = this.paymentTypeMap.get(billingModel.paymentMode).name;
      worksheet.getCell('F' + index).value = this.currency + ' ' + billingModel.amount + '/-';

      worksheet.getCell('A' + index).style = this.excelExportService.dataStyle;
      worksheet.getCell('B' + index).style = this.excelExportService.dataStyle;
      worksheet.getCell('D' + index).style = this.excelExportService.dataStyle;
      worksheet.getCell('E' + index).style = this.excelExportService.dataStyle;
      worksheet.getCell('F' + index).style = this.excelExportService.dataStyle;
      srNo++;
    });

    workbook.xlsx.writeBuffer().then((data1) => {
      let blob = new Blob([data1], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Billings Details.xlsx');
    })
  }

  private getData() {
    let data = [];
    let index = 0;
    data.push(this.getHeaderCaption());

    this.dataChange.value.map(billingModel => {
      let row = [];

      row.push({ text: (++index).toString(), style: 'subheader' });
      row.push({ text: this.customerMap.get(billingModel.customerId).name, style: 'subheader' });

      row.push({ text: formatDate(billingModel.purchaseDate, settings.SHOW_DATE_FORMAT, 'en'), style: 'subheader' });
      row.push({ text: this.paymentTypeMap.get(billingModel.paymentMode) ? this.paymentTypeMap.get(billingModel.paymentMode).name : '', style: 'subheader' });
      row.push({ text: this.currency + ' ' + billingModel.amount + '/-', style: 'subheader' });
      data.push(row);
    });

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
