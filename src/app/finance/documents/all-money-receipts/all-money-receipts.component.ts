import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { NotificationsService } from '../../../shared/notifications-service';
import { DeleteDialogComponent } from '../../../shared/dialog/delete/delete.component';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { settings } from '../../../demo/data';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { SessionModel } from '../../../session/session.model';
import { CashReceiptModel } from '../../documents/document.model';
import { BillingService } from '../../billing/billing.service';
import { CompanyService } from '../../../company-settings/company.service';
import { CompanyModel } from '../../../company-settings/company.model';
import { LoginModel } from '../../../auth/login-model';
import { DocumentService } from '../document.service';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { DocumentPdfService } from '../document-pdf.service';
import { PaymentTypeModel } from '../../../shared/common.models';
import { UtilsService } from '../../../shared/services/utils.service';

@Component({
  selector: 'app-all-money-receipts',
  templateUrl: './all-money-receipts.component.html',
  styleUrls: ['./all-money-receipts.component.sass']
})
export class AllMoneyReceiptsComponent implements OnInit {

  displayedColumns = [
    'staffId',
    'mobile',
    'staffLoanDate',
    'amount',
    'comment',
    'paidStatus',
    'actions'
  ];
  dataSource: ExampleDataSource | null;
  dataChange: BehaviorSubject<CashReceiptModel[]> = new BehaviorSubject<CashReceiptModel[]>([]);
  apiURL: string = environment.apiUrl;
  showDateFormat: string = settings.SHOW_DATE_FORMAT;
  currency = settings.CURRENCY;
  session: SessionModel;
  // companyMap: Map<number, CompanyModel> = new Map<number, CompanyModel>();
  login: LoginModel;
  companyModel: CompanyModel;
  paymentTypeMap: Map<number, PaymentTypeModel> = new Map<number, PaymentTypeModel>();
  constructor(
    private dialog: MatDialog,
    private documentService: DocumentService,
    private notification: NotificationsService,
    private localStorageData: LocalStorageData,
    private companyService: CompanyService,
    private pdfService: PdfService,
    private documentPdfService: DocumentPdfService,
    private utilsService: UtilsService,

    private router: Router
  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  ngOnInit() {
    this.session = this.localStorageData.sessionValue;
    this.login = this.localStorageData.userValue;
    this.companyService.getCompanyDetails(this.login.companyId).pipe(first()).subscribe(companyModel => {
      if (companyModel == undefined) {
        companyModel = new CompanyModel({});
      }
      this.companyModel = companyModel;
    });

    this.utilsService.getAllPaymentType().subscribe(data => {
      data.forEach(paymentType => this.paymentTypeMap.set(paymentType.id, paymentType));
    });
    this.loadData();
  }

  addNew() {
    this.router.navigate(['billing/finance/documents/add-money-receipt-format']);
  }

  editCall(row) {
    this.router.navigateByUrl('billing/finance/documents/add-money-receipt-format', { state: { cashReceiptModel: row, action: 'edit' } });
  }

  viewStaffProfile(row) {
    // this.router.navigateByUrl('billing/finance/documents/add-money-receipt-format', { state: { cashReceiptModel: row, action: 'view' } });
    this.generateMoneyReceiptPDF(row);
  }


  generateMoneyReceiptPDF(cashReceiptModel, action = 'open') {
    const header = this.documentPdfService.createMoneyReceiptHeader(this.companyModel);
    this.pdfService.generateCustomPDF(this.companyModel, this.documentPdfService.getMoneyReceiptPDFData(cashReceiptModel, this.paymentTypeMap), header, undefined, [20, 100, 20, 70], this.documentPdfService.getMoneyReceiptBackgorundLogoPosition(), undefined, { alignment: 'center', margin: [0, 0, 0, 0] }, 'portrait', action);
  }


  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: '',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.documentService.deleteCashReceipt(id).subscribe(() => {
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

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  public loadData() {
    this.dataChange = new BehaviorSubject<CashReceiptModel[]>([]);


    this.documentService.getAllCashReceipts(this.login.companyId).subscribe(data => {
      this.dataChange.next(data);
    });
    this.dataSource = new ExampleDataSource(
      this.dataChange,
      this.paginator,
      this.sort
    );
    fromEvent(this.filter.nativeElement, 'keyup')
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

}
export class ExampleDataSource extends DataSource<CashReceiptModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: CashReceiptModel[] = [];
  renderedData: CashReceiptModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<CashReceiptModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): CashReceiptModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<CashReceiptModel[]> {
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
        this.filteredData = this.data
          .slice()
          .filter((staffLoansModel: CashReceiptModel) => {
            const searchStr = (
              staffLoansModel.customerName +
              staffLoansModel.purchaseDate +
              staffLoansModel.amount
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
  sortData(data: CashReceiptModel[]): CashReceiptModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'staffLoansDate':
          [propertyA, propertyB] = [a.purchaseDate, b.purchaseDate];
          break;
        case 'amount':
          [propertyA, propertyB] = [a.amount, b.amount];
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
