import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CustomerService } from '../customer.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CustomerModel } from '../customer.model';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { settings } from '../../../demo/data';
import { NotificationsService } from '../../../shared/notifications-service';
import { ExcelExportService } from '../../../shared/excelExport/excelExport-service';
import { PdfService } from '../../../shared/pdfServices/pdfExport';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { UtilsService } from '../../../shared/services/utils.service';
import { DeleteDialogComponent } from '../../../shared/dialog/delete/delete.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { LocalStorageData } from '../../../shared/local-storage-data';
import { BillingService } from '../../billing/billing.service';
import { BillingModel } from '../../billing/billing.model';
import { LoginModel } from '../../../auth/login-model';
import { SessionModel } from '../../../session/session.model';
@Component({
  selector: 'app-all-customers',
  templateUrl: './all-customers.component.html',
  styleUrls: ['./all-customers.component.sass']
})
export class AllCustomerComponent implements OnInit {
  displayedColumns = [
    'id',
    'name',
    'contactPersonName',
    'email',
    'mobile',
    'emergencyMobile',
    'actions'
  ];

  dataSource: ExampleDataSource | null;
  selection = new SelectionModel<CustomerModel>(true, []);
  customer: CustomerModel | null;
  dataChange: BehaviorSubject<CustomerModel[]> = new BehaviorSubject<CustomerModel[]>([]);
  showDateFormat: string;
  customerTypeMap: Map<number, string> = new Map<number, string>();
  apiURL: string = environment.apiUrl;
  allBillingModels: number[] = [];
  login: LoginModel;
  session: SessionModel;

  constructor(
    private dialog: MatDialog,
    private customerService: CustomerService,
    private utilsService: UtilsService,
    private notification: NotificationsService,
    private pdfService: PdfService,
    private excelExportService: ExcelExportService,
    private billingService: BillingService,

    private router: Router,
    private localStorageData: LocalStorageData,

  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  ngOnInit() {

    this.login = this.localStorageData.userValue;
    this.login.companyId;
    this.showDateFormat = settings.SHOW_DATE_FORMAT;
    this.session = this.localStorageData.sessionValue;
    this.billingService.getAllBillings(this.login.companyId, this.session.id).subscribe(data => {
      data.forEach(element => this.allBillingModels.push(element.customerId));
    });

    this.loadData();
  }

  updateCustomerUrl(event, row) {
    event.target.src = "assets/images/user/avatar.png";
  }
  refresh() {
    this.loadData();
  }

  viewCustomerProfile(customer) {
    this.router.navigateByUrl('billing/finance/customers/about-customer', { state: { customer: customer, action: 'view' } });
  }

  get data(): CustomerModel[] {
    return this.dataChange.value;
  }

  addNew() {
    this.router.navigate(['billing/finance/customers/add-customer']);
  }

  editCall(row) {
    this.router.navigateByUrl('billing/finance/customers/add-customer', { state: { customerModel: row, action: 'edit' } });
  }

  updateCustomer(customer, id) {
    this.customerService.addNewCustomer(customer).subscribe(
      (data) => {
        const foundIndex = this.dataChange.value.findIndex(
          (x) => x.id == id
        );

        this.dataChange.value[
          foundIndex
        ] = data;
        this.refreshTable();
        this.notification.showNotification(
          'black',
          'Edit Record Successfully...!!!',
          'bottom',
          'center'
        );
      }
    );
  }

  deleteItem(row) {
    const id = row.id;
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: row.name,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == 1) {

        this.customerService.deleteCustomer(id).subscribe(() => {
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
  isAllSelected() {

    let numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    this.dataSource.renderedData.forEach((row) => {
      if (!row.active) {
        numSelected++;
      }
    });
    return numSelected == numRows;
  }

  masterToggle(event) {

    if (event.checked) {
      this.dataSource.renderedData.forEach((row) => {
        if (row.active) {
          this.selection.select(row);
        }
      });
    } else {
      this.selection.clear();
    }
  }

  public loadData() {


    this.dataChange = new BehaviorSubject<CustomerModel[]>([]);
    this.customerService.getAllCustomers(this.login.companyId).subscribe(
      data => {
        data.sort((a, b) => a.name.localeCompare(b.name));
        this.dataChange.next(data);
      }
    );
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
export class ExampleDataSource extends DataSource<CustomerModel> {
  _filterChange = new BehaviorSubject('');
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  filteredData: CustomerModel[] = [];
  renderedData: CustomerModel[] = [];
  constructor(
    public dataChange: BehaviorSubject<CustomerModel[]>,
    public _paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the customer changes the filter.
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
  }

  get data(): CustomerModel[] {
    return this.dataChange.value;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<CustomerModel[]> {
    const displayDataChanges = [
      this.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data
          .slice()
          .filter((customer: CustomerModel) => {
            const searchStr = (
              customer.name +
              customer.mobile
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
  sortData(data: CustomerModel[]): CustomerModel[] {
    if (!this._sort.active || this._sort.direction == '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'name':
          [propertyA, propertyB] = [a.name, b.name];
          break;
        case 'mobile':
          [propertyA, propertyB] = [a.mobile, b.mobile];
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